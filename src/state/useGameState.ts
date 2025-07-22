import { useState, useEffect } from 'react';
import { socket } from '../network/socket';

export interface GameState {
  players: [string, string];
  scores: [number, number];
  timerEnabled?: boolean;
  timerSeconds?: number;
}

export function useGameState(): GameState {
  const [gameState, setGameState] = useState<GameState>({
    players: ['Player 1', 'Player 2'],
    scores: [0, 0],
    timerEnabled: false,
    timerSeconds: 90,
  });

  useEffect(() => {
    const handleUpdate = (data: GameState) => {
      setGameState((prev) => ({ ...prev, ...data }));
    };

    socket.on('state_update', handleUpdate);
    return () => {
      socket.off('state_update', handleUpdate);
    };
  }, []);

  return gameState;
}
