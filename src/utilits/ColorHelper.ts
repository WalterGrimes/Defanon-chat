export const getUserColor = (uid: string) => {
    const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#F333FF',
        '#33FFF3', '#F3FF33', '#FF8333', '#8333FF',
        '#33FF83', '#FF3383'
    ];

    let uniqueNumber = 0;
    for (let i = 0; i < uid.length; i++) {
        uniqueNumber = uid.charCodeAt(i) + ((uniqueNumber << 5) - uniqueNumber);
    }

    const index = Math.abs(uniqueNumber) % colors.length;

    return colors[index];
}


