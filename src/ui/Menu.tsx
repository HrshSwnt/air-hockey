// src/ui/Menu.tsx
import { useState } from 'react';
import { useSessionState } from '../state/useSessionState';

export default function Menu() {
  const [tempName, setTempName] = useState('');
  const [tempRoom, setTempRoom] = useState('');
  const { session, joinRoom } = useSessionState();

  const handleJoin = () => {
    if (tempName && tempRoom) {
      joinRoom(tempName, tempRoom);
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-4 z-50">
      {session.status === 'idle' && (
        <>
          <h1 className="text-white text-2xl font-bold">Join or Create Room</h1>
          <input
            type="text"
            className="px-4 py-2 rounded w-64 text-center"
            placeholder="Your Name"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />
          <input
            type="text"
            className="px-4 py-2 rounded w-64 text-center"
            placeholder="Room Code"
            value={tempRoom}
            onChange={(e) => setTempRoom(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={handleJoin}
          >
            Enter Room
          </button>
        </>
      )}

      {session.status === 'waiting' && (
        <p className="text-white text-lg font-medium">Waiting for another player to join...</p>
      )}
    </div>
  );
}
