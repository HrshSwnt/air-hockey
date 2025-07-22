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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ name, room }) => {
    socket.join(room);
    playerInfo.set(socket.id, { name, room });

    if (!rooms.has(room)) {
      rooms.set(room, new Set());
    }

    const players = rooms.get(room);
    players.add(socket.id);

    console.log(`Player ${name} joined room ${room}`);

    if (players.size === 2) {
      // Notify both players to start the game
      for (let id of players) {
        io.to(id).emit('start-game');
      }
    } else {
      socket.emit('waiting');
    }
  });

  socket.on('disconnect', () => {
    const info = playerInfo.get(socket.id);
    if (info) {
      const { room } = info;
      const players = rooms.get(room);
      if (players) {
        players.delete(socket.id);
        if (players.size === 0) {
          rooms.delete(room);
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
