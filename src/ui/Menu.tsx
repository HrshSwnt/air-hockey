// src/ui/Menu.tsx
import { useState } from 'react';
import { useSessionState } from '../state/useSessionState';

export default function Menu() {
  const [tempName, setTempName] = useState('');
  const [tempRoom, setTempRoom] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const { session, joinRoom } = useSessionState();

  const handleJoin = () => {
    if (tempName && tempRoom) {
      joinRoom(tempName, tempRoom, timerEnabled, timerSeconds);
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

          <div className="flex items-center gap-2 text-white">
            <label>
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={() => setTimerEnabled(!timerEnabled)}
                className="mr-1"
              />
              Enable Timer
            </label>

            {timerEnabled && (
              <input
                type="number"
                className="w-20 px-2 py-1 rounded text-black"
                min={10}
                max={300}
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(parseInt(e.target.value))}
              />
            )}
            {timerEnabled && <span>seconds</span>}
          </div>

          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={handleJoin}
          >
            Enter Room
          </button>
        </>
      )}

      {session.status === 'waiting' && (
        <p className="text-white text-lg font-medium">
          Waiting for another player to join...
        </p>
      )}
    </div>
  );
}
