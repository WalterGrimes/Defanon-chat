const COLORS = [
    '#FF5733', '#33FF57', '#3357FF', '#F333FF',
    '#33FFF3', '#F3FF33', '#FF8333', '#8333FF',
    '#33FF83', '#FF3383'
];

const getHash = (uid: string): number => {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
};

export const getUserColor = (uid: string): string => {
    return COLORS[getHash(uid) % COLORS.length];
};

const darkenColor = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

export const getUserColorAdapted = (uid: string): string => {
    const color = getUserColor(uid);
    const theme = document.documentElement.getAttribute("data-theme") || "light";
    return theme === "light" ? darkenColor(color, 60) : color;
};