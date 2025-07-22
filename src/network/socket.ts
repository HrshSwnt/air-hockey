import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000');

socket.on('room_ready', (players) => {
  console.log('Room ready:', players);
  // You can update global state here or dispatch to zustand/reducer
});

socket.on('room_full', () => {
  alert('Room is full!');
});