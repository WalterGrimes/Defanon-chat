import React, { useEffect, useState } from "react";
import { GreyLoader } from "../features/Loaders";

interface MutedTimerProps {
    until: number;
    message: string;
}

export const MutedTimer: React.FC<MutedTimerProps> = ({ until, message }) => {
    const [secondsLeft, setSecondsLeft] = useState(Math.floor((until - Date.now()) / 1000));

    useEffect(() => {
        const timer = setInterval(() => {
            const left = Math.floor((until - Date.now()) / 1000);
            
            if (left <= 0) {
                clearInterval(timer);
                window.location.reload(); 
            } else {
                setSecondsLeft(left);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [until]);

    if (secondsLeft <= 0) return <GreyLoader message="Разблокировка..." />;

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    return <GreyLoader message={`${message} ${timeString}`} />;
};