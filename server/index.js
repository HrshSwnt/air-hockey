// server/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

const rooms = new Map(); // roomCode -> Set of socket IDs
const playerInfo = new Map(); // socket.id -> { name, room }

let gameStates = new Map(); // room -> { players: [name1, name2], scores: [0, 0] }

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', ({ name, room }) => {
        socket.join(room);
        playerInfo.set(socket.id, { name, room });

        if (!rooms.has(room)) {
            rooms.set(room, new Set());
            gameStates.set(room, { players: [], scores: [0, 0] });
        }

        const players = rooms.get(room);
        players.add(socket.id);

        const gameState = gameStates.get(room);
        gameState.players.push(name); // keep player order
        gameState.players = gameState.players.slice(0, 2);

        console.log(`Player ${name} joined room ${room}`);

        if (players.size === 2) {
            // Notify both players to start the game
            for (let id of players) {
                io.to(id).emit('start-game');
                io.to(id).emit('state_update', gameState);
            }
        } else {
            socket.emit('waiting');
        }
    });

    // server-side
    socket.on('score', ({ room, playerIndex }) => {
        const state = gameStates.get(room);
        if (!state) return;

        state.scores[playerIndex]++;
        io.to(room).emit('state_update', state);
    });


    socket.on('disconnect', () => {
        const info = playerInfo.get(socket.id);
        if (info) {
            const { room, name } = info;
            const players = rooms.get(room);
            const gameState = gameStates.get(room);

            if (players) {
                players.delete(socket.id);
                if (gameState) {
                    gameState.players = gameState.players.filter((p) => p !== name);
                }

                if (players.size === 0) {
                    rooms.delete(room);
                    gameStates.delete(room);
                }
            }

            playerInfo.delete(socket.id);
            console.log(`Player ${socket.id} disconnected from room ${room}`);
        }
    });
});


server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
