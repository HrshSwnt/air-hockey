import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

// === Types ===
type RoomCode = string;

interface PlayerInfo {
  name: string;
  room: RoomCode;
}

interface GameState {
  players: string[];
  scores: [number, number];
}

interface RoomSettings {
  timerEnabled: boolean;
  timerSeconds: number;
}

interface RoomRuntimeData {
  settings?: RoomSettings;
  hasStarted: Set<string>;
  firstStarter?: string; // socket.id of who first clicked Start
  settingsWereModified?: boolean; // only true if user changed default values
}

// === Server Setup ===
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// === In-Memory Storage ===
const rooms = new Map<RoomCode, Set<string>>();
const playerInfo = new Map<string, PlayerInfo>();
const gameStates = new Map<RoomCode, GameState>();
const roomSettings = new Map<RoomCode, RoomSettings>();
const roomRuntime = new Map<RoomCode, RoomRuntimeData>();

// === Socket Handling ===
io.on('connection', (socket: Socket) => {
  console.log('Connected:', socket.id);

  socket.on('join_room', ({ name, room }: { name: string; room: string }) => {
    socket.join(room);
    playerInfo.set(socket.id, { name, room });

    // Initialize room
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
      gameStates.set(room, { players: [], scores: [0, 0] });
      roomRuntime.set(room, {
        hasStarted: new Set(),
      });
    }

    const players = rooms.get(room)!;
    players.add(socket.id);

    const game = gameStates.get(room)!;
    game.players.push(name);
    game.players = game.players.slice(0, 2);

    socket.emit('waiting');

    // Show prefill settings if first player had already clicked Start
    const runtime = roomRuntime.get(room);
    if (runtime?.firstStarter && runtime.settings) {
      socket.emit('prefill_settings', runtime.settings);
    }

    // If both players are now present
    if (players.size === 2) {
      io.to(room).emit('both_ready');
    }
  });

  socket.on('start_game_request', ({ room, timerEnabled, timerSeconds }) => {
    const runtime = roomRuntime.get(room);
    const players = rooms.get(room);

    if (!runtime || !players || !players.has(socket.id)) return;

    const settingsChanged =
      timerEnabled !== true || timerSeconds !== 90;

    // If first to start, store settings
    if (!runtime.firstStarter) {
      runtime.firstStarter = socket.id;
      runtime.settings = { timerEnabled, timerSeconds };
      runtime.settingsWereModified = settingsChanged;

      // If another player is already present, notify them
      socket.to(room).emit('prefill_settings', runtime.settings);
    } else if (runtime.firstStarter !== socket.id) {
      // Second starter updates settings if desired
      runtime.settings = { timerEnabled, timerSeconds };
    }

    runtime.hasStarted.add(socket.id);

    // Both ready — start game
    if (runtime.hasStarted.size === 2) {
      const settings = runtime.settings!;
      io.to(room).emit('start-game', settings);

      if (settings.timerEnabled) {
        const duration = settings.timerSeconds * 1000;
        const startTime = Date.now();
        io.to(room).emit('timer_start', { startTime, duration });
      }

      // Reset room runtime state
      runtime.hasStarted.clear();
      runtime.firstStarter = undefined;
      runtime.settingsWereModified = false;
    } else {
      socket.emit('start_waiting_for_other');
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
    const state = gameStates.get(room);
    const runtime = roomRuntime.get(room);

    if (players) {
      players.delete(socket.id);
      runtime?.hasStarted.delete(socket.id);

      if (state) {
        state.players = state.players.filter((p) => p !== name);
      }

      if (players.size === 0) {
        rooms.delete(room);
        gameStates.delete(room);
        roomSettings.delete(room);
        roomRuntime.delete(room);
      }
    }

    playerInfo.delete(socket.id);
    console.log(`Player ${name} (${socket.id}) left room ${room}`);
  });
});

server.listen(3000, () => {
  console.log('Server listening on http://localhost:3000');
});
