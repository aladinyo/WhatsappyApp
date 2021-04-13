export default function scalePage() {
    if (window.innerHeight > 768 && window.innerWidth > 1366) {
        const currentRatio = window.innerHeight / window.innerWidth;
        const ratio = 768 / 1366;
        if (ratio < currentRatio) {
            return {
                width: 1366,
                height: window.innerHeight * (1366 / window.innerWidth),
                transform: `scale(${window.innerWidth / 1366})`
            };
        } else if (ratio > currentRatio) {
            return {
                width: window.innerWidth * (768 / window.innerHeight),
                height: 768,
                transform: `scale(${window.innerHeight / 768})`
            };
        } else {
            return {
                width: 1366,
                height: 768,
                transform: `scale(${window.innerHeight / 768})`
            };
        };
    };
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        transform: `scale(1)`
    };
};