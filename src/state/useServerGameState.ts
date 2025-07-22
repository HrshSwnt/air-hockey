import { useState, useEffect } from 'react';
import { socket } from '../network/socket';

export function useGameState() {
  const [gameState, setGameState] = useState({});

  useEffect(() => {
    socket.on('state_update', (data) => {
      setGameState(data);
    });

    return () => {
      socket.off('state_update');
    };
  }, []);

  return gameState;
}
