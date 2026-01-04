// Window management
let zIndex = 100;
let dragging = null;
let dragOffset = { x: 0, y: 0 };

// Folder icon click handlers (double-click to open)
document.querySelectorAll('.folder-icon[data-window]').forEach(icon => {
    // Single click to select
    icon.addEventListener('click', e => {
        e.preventDefault();
        // Deselect all icons
        document.querySelectorAll('.folder-icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
    });

    // Double click to open window
    icon.addEventListener('dblclick', e => {
        e.preventDefault();

        const win = document.getElementById('window-' + icon.dataset.window);

        if (win.classList.contains('is-open')) {
            // Bring to front
            win.style.zIndex = ++zIndex;
            return;
        }

        // Position window offset from System Folder
        const systemFolder = document.getElementById('window-system-folder');
        const folderRect = systemFolder.getBoundingClientRect();
        let left = folderRect.left + 30;
        let top = folderRect.top + 40;

        // Make sure it fits on screen
        if (left + 400 > window.innerWidth) {
            left = Math.max(20, window.innerWidth - 420);
        }
        if (top + 300 > window.innerHeight) {
            top = Math.max(50, window.innerHeight - 350);
        }

        win.style.left = left + 'px';
        win.style.top = top + 'px';
        win.classList.add('is-open');
        win.style.zIndex = ++zIndex;
    });
});

// Close button handlers
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const win = btn.closest('.window');
        win.classList.remove('is-open');
    });
});

// Window dragging
document.querySelectorAll('.window__titlebar').forEach(titlebar => {
    titlebar.addEventListener('mousedown', e => {
        if (e.target.classList.contains('window__close') ||
            e.target.classList.contains('window__zoom')) return;

        const win = titlebar.closest('.window');
        dragging = win;
        win.style.zIndex = ++zIndex;

        const rect = win.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;

        e.preventDefault();
    });
});

document.addEventListener('mousemove', e => {
    if (!dragging) return;

    let x = e.clientX - dragOffset.x;
    let y = e.clientY - dragOffset.y;

    // Constrain to screen
    x = Math.max(0, Math.min(x, window.innerWidth - dragging.offsetWidth));
    y = Math.max(20, Math.min(y, window.innerHeight - dragging.offsetHeight));

    dragging.style.left = x + 'px';
    dragging.style.top = y + 'px';
});

document.addEventListener('mouseup', () => {
    dragging = null;
});

// Bring window to front on click
document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => {
        win.style.zIndex = ++zIndex;
    });
});

// Deselect icons when clicking outside
document.addEventListener('click', e => {
    if (!e.target.closest('.folder-icon')) {
        document.querySelectorAll('.folder-icon').forEach(i => i.classList.remove('selected'));
    }
});
