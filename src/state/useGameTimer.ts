// src/state/useGameTimer.ts
import { useEffect, useState } from 'react';
import { socket } from '../network/socket';

export function useGameTimer() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0); // in ms
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const handleTimerStart = ({ startTime, duration }: { startTime: number; duration: number }) => {
      setStartTime(startTime);
      setDuration(duration);
    };

    socket.on('timer_start', handleTimerStart);
    return () => {
      socket.off('timer_start', handleTimerStart);
    };
  }, []);

  useEffect(() => {
    if (!startTime || !duration) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, startTime + duration - now);
      setRemaining(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration]);

  return remaining;
}
