// local timer hook not used in the server
import { useEffect, useState } from 'react';

export function useTimer(startSeconds: number, active: boolean): number {
    const [timeLeft, setTimeLeft] = useState(startSeconds);

    useEffect(() => {
        if (!active) return;

        setTimeLeft(startSeconds);
        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [startSeconds, active]);

    return timeLeft;
}
