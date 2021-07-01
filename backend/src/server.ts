import * as express from 'express';
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

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

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

    console.log(!!roomFinded?.users.find(user => user.username === username));
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

wss.on('connection', async (ws: WebSocket, req: http.IncomingMessage) => {
    let room = (req.headers.room as string | undefined);
    const username = (req.headers.username as string | undefined);

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
            ws.send('Username not informed');
        } else {
            ws.send('Room not informed.');
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
                ws.send('Username not informed');
            } else {
                ws.send('Room not informed.');
            }
            ws.close();
        }
    });
});

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${(server.address() as any).port} :)`);
});