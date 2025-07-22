import { useEffect, useState } from 'react';
import { socket } from '../network/socket';

export type SessionStatus = 'idle' | 'waiting' | 'starting' | 'in-game';

export interface SessionInfo {
    name: string;
    room: string;
    status: SessionStatus;
    timerEnabled: boolean;
    timerSeconds: number;
}

export interface UseSessionState {
    session: SessionInfo;
    joinRoom: (name: string, room: string) => void; // ✅ removed timer values
    resetSession: () => void;
}

export function useSessionState(): UseSessionState {
    const [session, setSession] = useState<SessionInfo>({
        name: '',
        room: '',
        status: 'idle',
        timerEnabled: false,
        timerSeconds: 90,
    });

    useEffect(() => {
        socket.on('waiting', () => {
            setSession((prev) => ({
                ...prev,
                status: 'waiting',
            }));
        });



        socket.on('prefill_settings', ({ timerEnabled, timerSeconds }) => {
            setSession((prev) => ({
                ...prev,
                timerEnabled,
                timerSeconds,
            }));
        });

        socket.on('start-game', (data: { timerEnabled: boolean; timerSeconds: number }) => {
            setSession((prev) => ({
                ...prev,
                status: 'starting',
                timerEnabled: data.timerEnabled,
                timerSeconds: data.timerSeconds,
            }));
            setTimeout(() => {
                setSession((prev) => ({ ...prev, status: 'in-game' }));
            }, 300);
        });

        socket.on('disconnect', () => {
            setSession({
                name: '',
                room: '',
                status: 'idle',
                timerEnabled: false,
                timerSeconds: 90,
            });
        });

        return () => {
            socket.off('waiting');
            socket.off('prefill_settings');
            socket.off('start-game');
            socket.off('disconnect');
        };
    }, []);

    const joinRoom = (name: string, room: string) => {
        setSession((prev) => ({ ...prev, name, room, status: 'waiting' }));
        socket.emit('join_room', { name, room });
    };


    const resetSession = () => {
        setSession({
            name: '',
            room: '',
            status: 'idle',
            timerEnabled: false,
            timerSeconds: 90,
        });
    };

    return { session, joinRoom, resetSession };
}
