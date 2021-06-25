import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as Redis from 'ioredis';
import { Room, Rooms } from './Room';
import { User } from './User';

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

const setVote = async (room: string, username: string, vote: string): Promise<void> => {
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

// const deleteVotes

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
            setUserIntoRoom(roomIndex, username);
        } else {
            rooms.push({ room, users: [ { username, role: 'admin' } ] });
        }
        await setRooms(rooms);
  
        ws.send('Hi there, I am a WebSocket server. ROOM ->' + room);
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
            if (channel === room) {
                ws.send(message);
            }
        });
    });

    ws.on('message', async (vote: string) => {
        if (room && username) {
            await setVote(room, username, vote);
            const roomFinded = await getRoom(room);

            if (roomFinded) {
                await redisPub.publish(room, JSON.stringify(roomFinded));
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