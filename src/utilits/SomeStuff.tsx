export const DiagonalLines = () => (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <line x1="0" y1="30" x2="100%" y2="85" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <line x1="20" y1="0" x2="80" y2="100%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <line x1="100%" y1="10" x2="0" y2="70%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="40" y1="100%" x2="100%" y2="20" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <line x1="0" y1="60%" x2="100%" y2="40" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
    </svg>
);

export const InfoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
);

export const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
    </svg>
);