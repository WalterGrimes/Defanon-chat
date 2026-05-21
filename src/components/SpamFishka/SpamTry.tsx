import { useEffect, useRef, useState } from "react";
import s from "./SpamTry.module.css";

interface SpamComboProps {
    count: number;
}

const getComboLabel = (count: number): string => {
    if (count <= 1) return "";
    if (count > 5) return `5 MAX`;  
    if (count < 10) return `x${count} !`;
    return `x${count} !`;
};

const getComboClassName = (count: number): string => {
    if (count > 10) return s.comboBlocked;
    if (count >= 7) return s.comboInsane;
    if (count >= 5) return s.comboEpic;
    if (count >= 3) return s.comboHot;
    return s.comboNormal;
};

export const SpamTry = ({ count }: SpamComboProps) => {
    const [visible, setVisible] = useState(false);
    const [label, setLabel] = useState("");
    const [currentClass, setCurrentClass] = useState("");
    const [animKey, setAnimKey] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (count < 2) {
            setVisible(false);
            return;
        }

        setLabel(getComboLabel(count));
        setCurrentClass(getComboClassName(count));
        setAnimKey(prev => prev + 1);
        setVisible(true);

        if (timerRef.current) clearTimeout(timerRef.current);

        const duration = count > 10 ? 2000 : 1200;
        timerRef.current = setTimeout(() => {
            setVisible(false);
        }, duration);
    }, [count]);

    if (!visible) return null;

    return (
        <div
            key={animKey}
            className={`${s.spamCombo} ${currentClass}`}
            aria-live="polite"
        >
            {label}
        </div>
    );
};