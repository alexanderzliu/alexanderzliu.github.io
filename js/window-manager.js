// Window management
let zIndex = 100;
let dragging = null;
let dragOffset = { x: 0, y: 0 };

// Icon click handlers - opens associated windows
document.querySelectorAll('[data-window]').forEach(icon => {
    icon.addEventListener('click', e => {
        e.preventDefault();

        if (window.iconDragOccurred) {
            window.iconDragOccurred = false;
            return;
        }

        const win = document.getElementById('window-' + icon.dataset.window);

        if (win.classList.contains('is-open')) {
            win.style.zIndex = ++zIndex;
            return;
        }

        // Folder icons: position relative to System Folder
        if (icon.classList.contains('folder-icon')) {
            const systemFolder = document.getElementById('window-system-folder');
            const folderRect = systemFolder.getBoundingClientRect();
            let left = folderRect.left + 30;
            let top = folderRect.top + 40;

            if (left + 400 > window.innerWidth) left = Math.max(20, window.innerWidth - 420);
            if (top + 300 > window.innerHeight) top = Math.max(50, window.innerHeight - 350);

            win.style.left = left + 'px';
            win.style.top = top + 'px';
            win.classList.add('is-open');
            win.style.zIndex = ++zIndex;
            return;
        }

        // Desktop icons: two-phase animation to prevent flash
        win.classList.add('is-opening');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                win.classList.remove('is-opening');
                win.classList.add('is-open');
                win.style.zIndex = ++zIndex;
            });
        });
    });
});

// Close button handlers
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const win = btn.closest('.window');
        win.classList.remove('is-open', 'is-zoomed');
    });
});

// Zoom button handlers
document.querySelectorAll('.window__zoom').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const win = btn.closest('.window');

        if (win.classList.contains('is-zoomed')) {
            // Restore previous size/position
            win.style.cssText = win.dataset.preZoom;
            win.classList.remove('is-zoomed');
        } else {
            // Save current state, zoom to fill screen
            win.dataset.preZoom = win.style.cssText;
            Object.assign(win.style, {
                left: '10px',
                top: '30px',
                width: `${window.innerWidth - 20}px`,
                height: `${window.innerHeight - 60}px`
            });
            win.classList.add('is-zoomed');
        }
    });
});

// Window dragging - with touch support
document.querySelectorAll('.window__titlebar').forEach(titlebar => {
    function handleDragStart(e) {
        if (e.target.classList.contains('window__close') ||
            e.target.classList.contains('window__zoom')) return;

        const win = titlebar.closest('.window');
        dragging = win;
        win.classList.add('is-dragging');
        win.style.zIndex = ++zIndex;

        const point = TouchUtils.getPoint(e);
        const rect = win.getBoundingClientRect();
        dragOffset.x = point.x - rect.left;
        dragOffset.y = point.y - rect.top;

        e.preventDefault();
    }

    titlebar.addEventListener('mousedown', handleDragStart);
    titlebar.addEventListener('touchstart', handleDragStart, { passive: false });
});

function handleDragMove(e) {
    if (!dragging) return;

    const point = TouchUtils.getPoint(e);
    let x = point.x - dragOffset.x;
    let y = point.y - dragOffset.y;

    // Constrain to screen
    x = Math.max(0, Math.min(x, window.innerWidth - dragging.offsetWidth));
    y = Math.max(20, Math.min(y, window.innerHeight - dragging.offsetHeight));

    dragging.style.left = x + 'px';
    dragging.style.top = y + 'px';
}

document.addEventListener('mousemove', handleDragMove);
document.addEventListener('touchmove', handleDragMove, { passive: false });

function handleDragEnd() {
    if (dragging) dragging.classList.remove('is-dragging');
    dragging = null;
}

document.addEventListener('mouseup', handleDragEnd);
document.addEventListener('touchend', handleDragEnd);
document.addEventListener('touchcancel', handleDragEnd);

// Bring window to front on click
document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => {
        win.style.zIndex = ++zIndex;
    });
});

