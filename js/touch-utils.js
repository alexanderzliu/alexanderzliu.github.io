// Touch event utilities
const TouchUtils = {
    getPoint(e) {
        const touch = e.touches?.[0] || e.changedTouches?.[0];
        const source = touch || e;
        return { x: source.clientX, y: source.clientY };
    },

    isMobile() {
        return window.innerWidth <= 600;
    }
};
