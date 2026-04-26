import { useRef } from "react";

export const useSpamSound = () => {
    const clickCount = useRef(0);
    const lastClickTime = useRef(0);

    const playSpamSound = () => {
        const now = Date.now();
        
        if (now - lastClickTime.current > 1000) {
            clickCount.current = 0;
        }

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = "triangle"; 
        
     
        const baseFreq = 150;
        const frequency = baseFreq + Math.pow(clickCount.current, 1.5) * 20;
        
        oscillator.frequency.setValueAtTime(frequency * 2, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency, audioCtx.currentTime + 0.02);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01); 
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2); 

        clickCount.current += 1;
        lastClickTime.current = now;
    };

    return playSpamSound;
};