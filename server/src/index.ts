// index.ts
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

// Types
type RoomCode = string;

interface PlayerInfo {
  name: string;
  room: RoomCode;
}

interface GameState {
  players: string[]; // max length 2
  scores: [number, number];
}

interface RoomSettings {
  timerEnabled: boolean;
  timerSeconds: number;
}

// Server Setup
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// In-memory storage
const rooms = new Map<RoomCode, Set<string>>();
const playerInfo = new Map<string, PlayerInfo>();
const gameStates = new Map<RoomCode, GameState>();
const roomSettings = new Map<RoomCode, RoomSettings>();

io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({
    name,
    room,
    timerEnabled,
    timerSeconds,
    overrideSettings
  }: {
    name: string;
    room: RoomCode;
    timerEnabled?: boolean;
    timerSeconds?: number;
    overrideSettings?: boolean; // <-- NEW
  }) => {
    socket.join(room);
    playerInfo.set(socket.id, { name, room });

    const isFirstJoin = !rooms.has(room);

    if (isFirstJoin) {
      rooms.set(room, new Set());
      gameStates.set(room, { players: [], scores: [0, 0] });
      roomSettings.set(room, {
        timerEnabled: !!timerEnabled,
        timerSeconds: typeof timerSeconds === 'number' ? timerSeconds : 90,
      });
    }

    const players = rooms.get(room)!;
    players.add(socket.id);

    const gameState = gameStates.get(room)!;
    gameState.players.push(name);
    gameState.players = gameState.players.slice(0, 2);

    const settings = roomSettings.get(room)!;

    // ✅ Only override settings if explicitly requested
    if (!isFirstJoin && overrideSettings) {
      if (typeof timerEnabled !== 'undefined') settings.timerEnabled = timerEnabled;
      if (typeof timerSeconds === 'number') settings.timerSeconds = timerSeconds;
      console.log(`[Room ${room}] Settings overridden by second player`, settings);
    }

    console.log(`Player ${name} joined room ${room}`);

    if (players.size === 2) {
      for (const id of players) {
        io.to(id).emit('start-game', settings);
        io.to(id).emit('state_update', gameState);
      }

      io.to(room).emit('timer_start', {
        startTime: Date.now(),
        duration: settings.timerSeconds * 1000,
      });

    } else {
      socket.emit('waiting', settings);
    }
  });



  socket.on('score', ({ room, playerIndex }: { room: RoomCode; playerIndex: 0 | 1 }) => {
    const state = gameStates.get(room);
    if (!state) return;

    state.scores[playerIndex]++;
    io.to(room).emit('state_update', state);
  });


  socket.on('ping-check', (cb?: () => void) => cb?.());

  socket.on('disconnect', () => {
    const info = playerInfo.get(socket.id);
    if (!info) return;

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
        roomSettings.delete(room);
      }
    }

    playerInfo.delete(socket.id);
    console.log(`Player ${socket.id} disconnected from room ${room}`);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
