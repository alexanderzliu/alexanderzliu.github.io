// Menu bar functionality
(function() {
    // State
    let openMenu = null;
    let undoStack = [];
    let redoStack = [];
    let desktopZoom = 1;
    const MAX_UNDO = 10;
    const ZOOM_STEP = 0.1;
    const ZOOM_MIN = 0.5;
    const ZOOM_MAX = 2;

    // Elements
    const desktop = document.querySelector('.desktop');
    const windowsContainer = document.querySelector('.windows-container');

    // Menu actions
    const menuActions = {
        'close-all': () => {
            const openWindows = document.querySelectorAll('.window.is-open');
            const closedIds = [];
            openWindows.forEach(win => {
                closedIds.push(win.id);
                win.classList.remove('is-open', 'is-zoomed');
            });
            if (closedIds.length > 0) {
                pushUndo({ type: 'close-all', windowIds: closedIds });
            }
        },

        'undo': () => {
            if (undoStack.length === 0) return;
            const action = undoStack.pop();

            if (action.type === 'close-all') {
                // Reopen all windows that were closed
                action.windowIds.forEach(id => {
                    const win = document.getElementById(id);
                    if (win) win.classList.add('is-open');
                });
                redoStack.push(action);
            } else if (action.type === 'close') {
                const win = document.getElementById(action.windowId);
                if (win) win.classList.add('is-open');
                redoStack.push(action);
            } else if (action.type === 'open') {
                const win = document.getElementById(action.windowId);
                if (win) win.classList.remove('is-open', 'is-zoomed');
                redoStack.push(action);
            }
        },

        'redo': () => {
            if (redoStack.length === 0) return;
            const action = redoStack.pop();

            if (action.type === 'close-all') {
                action.windowIds.forEach(id => {
                    const win = document.getElementById(id);
                    if (win) win.classList.remove('is-open', 'is-zoomed');
                });
                undoStack.push(action);
            } else if (action.type === 'close') {
                const win = document.getElementById(action.windowId);
                if (win) win.classList.remove('is-open', 'is-zoomed');
                undoStack.push(action);
            } else if (action.type === 'open') {
                const win = document.getElementById(action.windowId);
                if (win) win.classList.add('is-open');
                undoStack.push(action);
            }
        },

        'zoom-in': () => {
            desktopZoom = Math.min(ZOOM_MAX, desktopZoom + ZOOM_STEP);
            applyZoom();
        },

        'zoom-out': () => {
            desktopZoom = Math.max(ZOOM_MIN, desktopZoom - ZOOM_STEP);
            applyZoom();
        },

        'zoom-reset': () => {
            desktopZoom = 1;
            applyZoom();
        },

        'quote': () => {
            const quoteWin = document.getElementById('window-quote');
            const quoteText = document.getElementById('quote-text');
            const quoteAuthor = document.getElementById('quote-author');

            // Pick random quote
            const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            quoteText.textContent = `"${quote.text}"`;
            quoteAuthor.textContent = `— ${quote.author}`;

            // Center and open window
            quoteWin.style.left = `${(window.innerWidth - 400) / 2}px`;
            quoteWin.style.top = `${(window.innerHeight - 180) / 2}px`;
            quoteWin.classList.add('is-open');
            quoteWin.style.zIndex = ++zIndex;
        }
    };

    function pushUndo(action) {
        undoStack.push(action);
        if (undoStack.length > MAX_UNDO) {
            undoStack.shift();
        }
        // Clear redo stack on new action
        redoStack = [];
    }

    function applyZoom() {
        const scale = `scale(${desktopZoom})`;
        desktop.style.transform = scale;
        desktop.style.transformOrigin = 'top left';
        windowsContainer.style.transform = scale;
        windowsContainer.style.transformOrigin = 'top left';
    }

    function closeAllMenus() {
        document.querySelectorAll('.menu-bar__item.is-open').forEach(item => {
            item.classList.remove('is-open');
        });
        openMenu = null;
    }

    // Toggle dropdown on menu item click
    document.querySelectorAll('.menu-bar__item[data-menu]').forEach(item => {
        item.addEventListener('click', e => {
            e.stopPropagation();

            // If clicking on a dropdown item, don't toggle
            if (e.target.classList.contains('menu-dropdown__item')) return;

            const wasOpen = item.classList.contains('is-open');
            closeAllMenus();

            if (!wasOpen) {
                item.classList.add('is-open');
                openMenu = item;
            }
        });
    });

    // Execute action on dropdown item click
    document.querySelectorAll('.menu-dropdown__item[data-action]').forEach(item => {
        item.addEventListener('click', e => {
            e.stopPropagation();
            const action = item.dataset.action;
            if (menuActions[action]) {
                menuActions[action]();
            }
            closeAllMenus();
        });
    });

    // Close menus when clicking outside
    document.addEventListener('click', e => {
        if (!e.target.closest('.menu-bar__item')) {
            closeAllMenus();
        }
    });

    // Track window open/close for undo/redo
    // Hook into existing close button handlers
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const win = btn.closest('.window');
            if (win && win.classList.contains('is-open')) {
                pushUndo({ type: 'close', windowId: win.id });
            }
        }, true); // Use capture to run before the actual close
    });

    // Hook into icon clicks that open windows
    document.querySelectorAll('.desktop-icon[data-window], .folder-icon[data-window]').forEach(icon => {
        icon.addEventListener('click', () => {
            const win = document.getElementById('window-' + icon.dataset.window);
            if (win && !win.classList.contains('is-open')) {
                pushUndo({ type: 'open', windowId: win.id });
            }
        }, true); // Use capture to run before the actual open
    });
})();
