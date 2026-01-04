// Window resizing
document.querySelectorAll('.window__resize').forEach(handle => {
    let resizing = null;
    let startSize = { w: 0, h: 0 };
    let startPos = { x: 0, y: 0 };

    handle.addEventListener('mousedown', e => {
        resizing = handle.closest('.window');
        startSize.w = resizing.offsetWidth;
        startSize.h = resizing.offsetHeight;
        startPos.x = e.clientX;
        startPos.y = e.clientY;
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', e => {
        if (!resizing) return;
        const newW = Math.max(200, startSize.w + (e.clientX - startPos.x));
        const newH = Math.max(150, startSize.h + (e.clientY - startPos.y));
        resizing.style.width = newW + 'px';
        resizing.style.height = newH + 'px';
    });

    document.addEventListener('mouseup', () => {
        resizing = null;
    });
});
