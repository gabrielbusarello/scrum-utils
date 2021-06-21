import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as Redis from 'ioredis';
import { Rooms } from './Room';
import { User } from './User';

const redis = new Redis('localhost');

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

server.on()

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage, client: WebSocket) => {
    let room = (req.headers.room as string | undefined);
    const username = (req.headers.username as string | undefined);

    ws.on('open', async (ws: WebSocket) => {
    
        if (room && username) {
            if (room === 'new') {
                room = new Date().getTime().toString();
            }
    
            const rooms = await redis.get('rooms');
            
            if (rooms) {
                const roomsJ: Rooms = JSON.parse(rooms);
    
                const roomFinded = roomsJ.find((roomJ) => roomJ.room === room);
    
                if (roomFinded) {
                    if (!roomFinded.users.find((user) => user.username === username)) {
                        roomFinded.users.push({ username, ws: client });
                    }
    
                    //connection is up, let's add a simple simple event
                } else {
                    roomsJ.push({ room, users: [{ username, ws: client }] });
                }
                redis.set('rooms', JSON.stringify(roomsJ));
            } else {
                redis.set('rooms', '[]');
            }
        
            // const value = await redis.get('teste');
            //send immediatly a feedback to the incoming connection    
            ws.send('Hi there, I am a WebSocket server. ROOM ->' + room);
        } else {
            ws.send('Room not informed.');
            ws.close();
        }
    })

    ws.on('message', async (message: string) => {
        const rooms = await redis.get('rooms');

        if (rooms) {
            const roomsJ: Rooms = JSON.parse(rooms);
            const roomJ = roomsJ.find((roomJ) => roomJ.room === room);
    
            //log the received message and send it back to the client
            console.log('received: %s', message);
    
            const broadcastRegex = /^broadcast\:/;
    
            if (roomJ) {
                roomJ.users.forEach(user => {
                    ws.send('hello guys');
                    user.ws.send('sender guys');
                    // if (user.ws !== ws) {
                    //     user.ws.send(`Hello, broadcast message -> ${message}`);
                    // }
                });
            }
        }

        // if (broadcastRegex.test(message)) {
        //     message = message.replace(broadcastRegex, '');

        //     //send back the message to the other clients
            // wss.clients
            //     .forEach(client => {
            //         if (client != ws) {
            //             client.send(`Hello, broadcast message -> ${message}`);
            //         }    
            //     });
        // } else {
        //     ws.send(`Hello, you sent -> ${message}`);
        // }
    });
});

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address()} :)`);
});