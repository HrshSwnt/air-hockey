import { useEffect, useState } from 'react';
import { socket } from '../network/socket';

export interface GameSettings {
  timerEnabled: boolean;
  timerSeconds: number;
}

export function useGameSettings(): GameSettings {
  const [settings, setSettings] = useState<GameSettings>({
    timerEnabled: false,
    timerSeconds: 90,
  });

  useEffect(() => {
    socket.on('start-game', (data: Partial<GameSettings>) => {
      setSettings({
        timerEnabled: !!data.timerEnabled,
        timerSeconds: typeof data.timerSeconds === 'number' ? data.timerSeconds : 90,
      });
    });

    return () => {
      socket.off('start-game');
    };
  }, []);

  return settings;
}
