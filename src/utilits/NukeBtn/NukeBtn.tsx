import { useState, useEffect, useRef } from 'react';
import s from './NukeBtn.module.css';

interface NukeBtnProps {
    onClick: () => void;
}

export const NukeBtn = ({ onClick }: NukeBtnProps) => {
    const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [modalPupil, setModalPupil] = useState({ x: 0, y: 0 });
    const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const modalAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isHovered) {
            let t = -Math.PI / 2;
            animRef.current = setInterval(() => {
                t += 0.03;
                setPupilOffset({ x: Math.sin(t) * 5, y: 0 });
            }, 16);
        } else {
            if (animRef.current) clearInterval(animRef.current);
            setPupilOffset({ x: 0, y: 0 });
        }
        return () => { if (animRef.current) clearInterval(animRef.current); };
    }, [isHovered]);

    useEffect(() => {
        if (showConfirm) {
            let t = -Math.PI / 2;
            modalAnimRef.current = setInterval(() => {
                t += 0.03;
                setModalPupil({ x: Math.sin(t) * 5, y: 0 });
            }, 7);
        } else {
            if (modalAnimRef.current) clearInterval(modalAnimRef.current);
            setModalPupil({ x: 0, y: 0 });
        }
        return () => { if (modalAnimRef.current) clearInterval(modalAnimRef.current); };
    }, [showConfirm]);

    const handleConfirm = () => {
        setShowConfirm(false);
        onClick();
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className={s.nukeBtn}
                title="Danger Zone" onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <svg width="20" height="20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                    <circle cx="50" cy="50" r="46" />
                    <path d="M10 50 Q50 5 90 50" strokeLinecap="round" />
                    <path d="M10 50 Q50 95 90 50" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="18" />
                    <circle cx={50 + pupilOffset.x} cy={50} r="7" fill="currentColor" />
                </svg>
            </button>

            {showConfirm && (
                <div className={s.overlay}>
                    <div className={s.modal}>
                        <div className={s.modalIcon}>
                            <svg width="64" height="64" viewBox="0 0 100 100" fill="none" stroke="#fff" strokeWidth="4">
                                <circle cx="50" cy="50" r="46" />
                                <path d="M10 50 Q50 5 90 50" strokeLinecap="round" />
                                <path d="M10 50 Q50 95 90 50" strokeLinecap="round" />
                                <circle cx="50" cy="50" r="18" />
                                <circle
                                    cx={50 + modalPupil.x}
                                    cy={50}
                                    r="7"
                                    fill="#fff"
                                    stroke="none"
                                />
                            </svg>
                        </div>
                        <h4 className={s.modalTitle}>Danger Zone</h4>
                        <p className={s.modalText}>
                            This will delete <strong>everything</strong>: your account and all associated data will be gone forever.
                        </p>
                        <div className={s.modalBtns}>
                            <button className={s.cancelBtn} onClick={() => setShowConfirm(false)}>
                                Cancel
                            </button>
                            <button className={s.confirmBtn} onClick={handleConfirm}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};