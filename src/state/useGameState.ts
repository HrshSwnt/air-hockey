// src/state/useGameState.ts
import { useState, useEffect } from 'react';
import { socket } from '../network/socket';

export interface GameState {
  players: [string, string]; // [Player1Name, Player2Name]
  scores: [number, number];  // [Score1, Score2]
}

export function useGameState(): GameState {
  const [gameState, setGameState] = useState<GameState>({
    players: ['Player 1', 'Player 2'],
    scores: [0, 0],
  });

  useEffect(() => {
    const handleUpdate = (data: GameState) => {
      setGameState(data);
    };

    socket.on('state_update', handleUpdate);
    return () => {
      socket.off('state_update', handleUpdate);
    };
  }, []);

  return gameState;
}
