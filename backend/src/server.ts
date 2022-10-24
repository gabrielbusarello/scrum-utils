import * as express from 'express';
import * as session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as Redis from 'ioredis';
import { Room, Rooms } from './Room';
import { User } from './User';
import { Action, VoteMessage } from './VoteMessage';

const redis = new Redis('localhost');
const redisSub = new Redis('localhost');
const redisPub = new Redis('localhost');

const app = express();
const map = new Map();

//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false
});

app.use(express.static('public'));
app.use(sessionParser);

//initialize a simple http server
const server = http.createServer(app);

declare module 'express-session' {
    interface SessionData {
        userId: string;
        userName: string;
        room: string;
    }
}

app.post('/login', function (req, res) {
    //
    // "Log in" user and set userId to session.
    //
    const id = uuidv4();
    const { username, room } = req.headers;

    console.log(`Updating session for user ${id}`);

    req.session.userId = id;
    req.session.userName = username as string;
    req.session.room = room as string;
    res.send({ result: 'OK', message: 'Session updated' });
});

app.delete('/logout', function (request, response) {
    const ws = map.get(request.session.userId);

    console.log('Destroying session');
    request.session.destroy(function () {
        if (ws) ws.close();

        response.send({ result: 'OK', message: 'Session destroyed' });
    });
});

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });
  
server.on('upgrade', function (request, socket, head) {
    console.log('Parsing session from request...');

    sessionParser(request, {} as any, () => {
        if (!request.session.userId) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        console.log('Session is parsed!');

        wss.handleUpgrade(request, socket, head, function (ws) {
            wss.emit('connection', ws, request);
        });
    });
});

const init = async () => {
    const rooms = await redis.get('rooms');

    if (!rooms) {
        redis.set('rooms', '[]');
    }
};

const getRooms = async (): Promise<Rooms> => {
    const rooms = await redis.get('rooms');

    return rooms ? JSON.parse(rooms) : '';
}

const getRoom = async (room: string): Promise<Room | undefined> => {
    const rooms = await getRooms();

    return rooms.find((roomF) => roomF.room === room);
}

const getRoomIndex = async (room: string): Promise<number> => {
    const rooms = await getRooms();

    return rooms.findIndex((roomF) => roomF.room === room);
}

const getUserInRoom = async (room: string, username: string): Promise<boolean> => {
    const roomFinded = await getRoom(room);

    return !!roomFinded?.users.find(user => user.username === username);
}

const getUserRole = async (room: string, username: string): Promise<boolean> => {
    const roomFinded = await getRoom(room);

    return !!roomFinded?.users.find(user => user.username === username && user.role === 'admin');
}

const setRooms = async (rooms: Rooms): Promise<void> => {
    await redis.set('rooms', JSON.stringify(rooms));
}

const setUserIntoRoom = async (roomIndex: number, username: string): Promise<void> => {
    let rooms = await getRooms();

    if (!rooms[roomIndex].users.find((user) => user.username === username)) {
        rooms[roomIndex].users.push({ username, role: 'user' });
    }

    await setRooms(rooms);
}

const setVote = async (room: string, username: string, vote: number): Promise<void> => {
    let rooms = await getRooms();
    const roomIndex = await getRoomIndex(room);

    if (roomIndex > -1) {
        rooms[roomIndex].users = rooms[roomIndex].users.map(user => {
            if (user.username === username) {
                user.vote = vote;
            }

            return user;
        });

        await setRooms(rooms);
    }
};

const toggleStatus = async (room: string): Promise<void> => {
    let rooms = await getRooms();
    const roomIndex = await getRoomIndex(room);

    if (roomIndex > -1) {
        rooms[roomIndex].status = rooms[roomIndex].status === 'hide' ? 'show' : 'hide';
    }

    await setRooms(rooms);
};

const deleteVotes = async (room: string): Promise<void> => {
    let rooms = await getRooms();
    const roomIndex = await getRoomIndex(room);

    if (roomIndex > -1) {
        rooms[roomIndex].users = rooms[roomIndex].users.map(user => {
            user.vote = null;

            return user;
        });

        rooms[roomIndex].status = 'hide';
    }

    await setRooms(rooms);
};

const clearRoom = async (room: string): Promise<void> => {
    let rooms = await getRooms();
    const roomIndex = await getRoomIndex(room);

    if (roomIndex > -1) {
        rooms[roomIndex].users = rooms[roomIndex].users.filter(user => user.role === 'admin');
    }

    await setRooms(rooms);
};

wss.on('connection', async (ws: WebSocket, req: { session: { room: string, userName: string } }) => {
    let room = (req.session.room);
    const username = (req.session.userName);

    await init();

    if (room && username) {
        if (room === 'new') {
            room = new Date().getTime().toString();
        }

        const rooms = await getRooms();
        const roomIndex = await getRoomIndex(room);

        if (roomIndex > -1) {
            await setUserIntoRoom(roomIndex, username);

            const roomFinded = await getRoom(room);

            await redisPub.publish(room, JSON.stringify(roomFinded));
        } else {
            rooms.push({ room, users: [ { username, role: 'admin' } ], status: 'hide' });
            await setRooms(rooms);
        }
    } else {
        if (room) {
            ws.send('{ "message": "Username not informed" }');
        } else {
            ws.send('{ "message": "Room not informed." }');
        }
        ws.close();
    }

    redisSub.subscribe(room || '', () => {
        redisSub.on('message', (channel, message) => {
            const disconnect = JSON.parse(message).disconnect;

            if (disconnect) {
                ws.send('Username not in room');
                ws.close();
            } else if (channel === room) {
                ws.send(message);
            }
        });
    });

    ws.on('message', async (message: string) => {
        const voteMessage: VoteMessage = JSON.parse(message);
        let disconnect: boolean = false;

        if (room && username) {
            const userInRoom = await getUserInRoom(room, username);
            if (userInRoom) {
                if (voteMessage.action === Action.Vote) {
                    await setVote(room, username, voteMessage.vote);
                } else if (voteMessage.action === Action.Toggle && getUserRole(room, username)) {
                    await toggleStatus(room);
                } else if (voteMessage.action === Action.DeleteVotes && getUserRole(room, username)) {
                    await deleteVotes(room);
                } else if (voteMessage.action === Action.ClearRoom && getUserRole(room, username)) {
                    await clearRoom(room);
                }
            } else {
                disconnect = true;
            }

            const roomFinded = await getRoom(room);

            if (roomFinded) {
                await redisPub.publish(room, JSON.stringify(Object.assign({ disconnect }, roomFinded)));
            }
        } else {
            if (room) {
                ws.send('{ "message": "Username not informed" }');
            } else {
                ws.send('{ "message": "Room not informed." }');
            }
            ws.close();
        }
    });
});

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${(server.address() as any).port} :)`);
});