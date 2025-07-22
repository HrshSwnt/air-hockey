import { useEffect, useState } from 'react';
import { socket } from '../network/socket';
import { useSessionState } from '../state/useSessionState';

export default function Menu() {
  const [tempName, setTempName] = useState('');
  const [tempRoom, setTempRoom] = useState('');

  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [hasChangedSettings, setHasChangedSettings] = useState(false);

  const [otherPlayerJoined, setOtherPlayerJoined] = useState(false);
  const [waitingForOther, setWaitingForOther] = useState(false);
  const [hasReceivedPrefill, setHasReceivedPrefill] = useState(false);

  const { session, joinRoom } = useSessionState();

  useEffect(() => {
    const handleBothReady = () => setOtherPlayerJoined(true);

    const handlePrefill = ({
      timerEnabled: incomingEnabled,
      timerSeconds: incomingSeconds,
    }: {
      timerEnabled: boolean;
      timerSeconds: number;
    }) => {
      // Only apply if user hasn't changed their own settings yet
      if (!hasChangedSettings) {
        setTimerEnabled(incomingEnabled);
        setTimerSeconds(incomingSeconds);
      }
      setHasReceivedPrefill(true);
    };

    const handleStartWaitingForOther = () => {
      setWaitingForOther(true);
    };

    const handleStartGame = () => {
      setWaitingForOther(false);
      setHasReceivedPrefill(false);
      setHasChangedSettings(false);
    };

    socket.on('both_ready', handleBothReady);
    socket.on('prefill_settings', handlePrefill);
    socket.on('start_waiting_for_other', handleStartWaitingForOther);
    socket.on('start-game', handleStartGame);

    return () => {
      socket.off('both_ready', handleBothReady);
      socket.off('prefill_settings', handlePrefill);
      socket.off('start_waiting_for_other', handleStartWaitingForOther);
      socket.off('start-game', handleStartGame);
    };
  }, [hasChangedSettings]);

  const handleJoin = () => {
    if (tempName && tempRoom) {
      joinRoom(tempName, tempRoom);
    }
  };

  const handleStartGame = () => {
    setWaitingForOther(true);
    socket.emit('start_game_request', {
      room: session.room,
      timerEnabled,
      timerSeconds,
      hasChangedSettings, // for bonus: suppress override if just default
    });
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center gap-4 z-50">
      {/* === JOIN SCREEN === */}
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

      {/* === SETTINGS SCREEN === */}
      {session.status === 'waiting' && !waitingForOther && (
        <>
          <div className="text-white text-lg font-medium text-center">
            {otherPlayerJoined
              ? hasReceivedPrefill
                ? 'Other player started the game — you can confirm or change settings.'
                : 'Another player joined! Configure settings and start the game.'
              : 'Waiting for another player to join... You can configure settings meanwhile.'}
          </div>

          <div className="flex items-center gap-2 text-white">
            <label>
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => {
                  setTimerEnabled(e.target.checked);
                  setHasChangedSettings(true);
                }}
                className="mr-1"
              />
              Enable Timer
            </label>

            {timerEnabled && (
              <>
                <input
                  type="number"
                  className="w-20 px-2 py-1 rounded text-black"
                  min={10}
                  max={300}
                  value={timerSeconds}
                  onChange={(e) => {
                    setTimerSeconds(parseInt(e.target.value) || 90);
                    setHasChangedSettings(true);
                  }}
                />
                <span>seconds</span>
              </>
            )}
          </div>

          <button
            disabled={waitingForOther}
            className={`px-6 py-2 rounded ${waitingForOther ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            onClick={handleStartGame}
          >
            Start Game
          </button>

        </>
      )}

      {/* === WAITING FOR OTHER PLAYER TO CONFIRM START === */}
      {session.status === 'waiting' && waitingForOther && (
        <div className="text-white text-lg font-medium text-center">
          Waiting for the other player to press Start...
        </div>
      )}
    </div>
  );
}
