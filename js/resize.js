// Window resizing with touch support
// Uses single shared state to avoid duplicate event listeners

let resizing = null;
let startSize = { w: 0, h: 0 };
let startPos = { x: 0, y: 0 };

function handleResizeStart(e) {
    resizing = e.currentTarget.closest('.window');
    startSize.w = resizing.offsetWidth;
    startSize.h = resizing.offsetHeight;

    const point = TouchUtils.getPoint(e);
    startPos.x = point.x;
    startPos.y = point.y;

    e.preventDefault();
    e.stopPropagation();
}

function handleResizeMove(e) {
    if (!resizing) return;

    const point = TouchUtils.getPoint(e);
    const newW = Math.max(200, startSize.w + (point.x - startPos.x));
    const newH = Math.max(150, startSize.h + (point.y - startPos.y));
    resizing.style.width = newW + 'px';
    resizing.style.height = newH + 'px';
}

function handleResizeEnd() {
    resizing = null;
}

// Attach start handlers to each resize handle
document.querySelectorAll('.window__resize').forEach(handle => {
    handle.addEventListener('mousedown', handleResizeStart);
    handle.addEventListener('touchstart', handleResizeStart, { passive: false });
});

// Global move/end handlers - added only once
document.addEventListener('mousemove', handleResizeMove);
document.addEventListener('touchmove', handleResizeMove, { passive: false });
document.addEventListener('mouseup', handleResizeEnd);
document.addEventListener('touchend', handleResizeEnd);
document.addEventListener('touchcancel', handleResizeEnd);
