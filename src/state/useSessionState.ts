// src/state/useSessionState.ts
import { useEffect, useState } from 'react';
import { socket } from '../network/socket';

export type SessionStatus = 'idle' | 'waiting' | 'starting' | 'in-game';

export interface SessionInfo {
  name: string;
  room: string;
  status: SessionStatus;
}

export interface UseSessionState {
  session: SessionInfo;
  joinRoom: (name: string, room: string) => void;
  resetSession: () => void;
}

export function useSessionState(): UseSessionState {
  const [session, setSession] = useState<SessionInfo>({
    name: '',
    room: '',
    status: 'idle',
  });

  useEffect(() => {
    socket.on('waiting', () => {
      setSession((prev) => ({ ...prev, status: 'waiting' }));
    });

    socket.on('start-game', () => {
      setSession((prev) => ({ ...prev, status: 'starting' }));
      setTimeout(() => {
        setSession((prev) => ({ ...prev, status: 'in-game' }));
      }, 300);
    });

    socket.on('disconnect', () => {
      setSession({ name: '', room: '', status: 'idle' });
    });

    return () => {
      socket.off('waiting');
      socket.off('start-game');
      socket.off('disconnect');
    };
  }, []);

  const joinRoom = (name: string, room: string) => {
    setSession({ name, room, status: 'waiting' });
    socket.emit('join_room', { name, room });
  };

  const resetSession = () => {
    setSession({ name: '', room: '', status: 'idle' });
  };

  return { session, joinRoom, resetSession };
}
