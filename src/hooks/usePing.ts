import { useEffect, useState } from 'react';
import { socket } from '../network/socket';

export function usePing(): number {
    const [ping, setPing] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const start = Date.now();
            socket.volatile.emit('ping-check', () => {
                setPing(Date.now() - start);
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return ping;
}
