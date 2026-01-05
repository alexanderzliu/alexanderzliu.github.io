// Boot Animation - Terminal startup sequence
// Plays on first visit per session, then opens System Folder

(function() {
    const BOOT_KEY = 'hasBooted';

    // Check if we should skip the boot sequence
    const shouldSkipBoot = () => sessionStorage.getItem(BOOT_KEY) === 'true';

    // Mark boot as complete
    const markBooted = () => sessionStorage.setItem(BOOT_KEY, 'true');

    // Get DOM elements
    const bootScreen = document.getElementById('boot-screen');
    const bootCursor = document.getElementById('boot-cursor');
    const desktop = document.querySelector('.desktop');
    const menuBar = document.querySelector('.menu-bar');
    const desktopIcon = document.querySelector('.desktop-icon[data-window="system-folder"]');
    const systemFolderWindow = document.getElementById('window-system-folder');

    // Terminal messages
    const messages = [
        '> Hi! Thanks for visiting',
        '> Please enjoy your stay',
        '> Loading...'
    ];

    // Skip boot and show desktop immediately
    function skipBoot() {
        if (bootScreen) {
            bootScreen.classList.add('boot-screen--hidden');
        }
        if (desktop) {
            desktop.classList.remove('desktop--hidden');
        }
        if (menuBar) {
            menuBar.classList.remove('menu-bar--hidden');
        }
        if (systemFolderWindow) {
            systemFolderWindow.classList.add('is-open');
        }
        if (bootCursor) {
            bootCursor.style.display = 'none';
        }
        markBooted();
    }

    // Type a message character by character
    function typeMessage(element, text, speed = 30) {
        return new Promise(resolve => {
            let i = 0;
            element.classList.add('boot-screen__line--visible');

            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    // Animate cursor to target element
    function animateCursor(targetElement) {
        return new Promise(resolve => {
            const rect = targetElement.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2;

            // Start position (bottom left of screen)
            bootCursor.style.left = '50px';
            bootCursor.style.top = `${window.innerHeight - 50}px`;
            bootCursor.classList.add('boot-cursor--visible');

            // Trigger reflow before adding transition
            bootCursor.offsetHeight;

            // Move to target
            bootCursor.classList.add('boot-cursor--moving');
            bootCursor.style.left = `${targetX}px`;
            bootCursor.style.top = `${targetY}px`;

            // Wait for movement to complete
            setTimeout(resolve, 850);
        });
    }

    // Simulate click on element
    function simulateClick(element) {
        return new Promise(resolve => {
            // Click animation on cursor
            bootCursor.classList.add('boot-cursor--clicking');

            // Add active state to icon
            element.classList.add('clicking');
            const iconImage = element.querySelector('.desktop-icon__image');
            if (iconImage) {
                iconImage.style.transform = 'scale(0.85)';
            }

            setTimeout(() => {
                bootCursor.classList.remove('boot-cursor--clicking');
                element.classList.remove('clicking');
                if (iconImage) {
                    iconImage.style.transform = '';
                }
                resolve();
            }, 150);
        });
    }

    // Open the system folder window
    function openSystemFolder() {
        if (!systemFolderWindow) return;

        // Disable the default page-load animation for system folder
        // (it has a delay that causes a flash)
        systemFolderWindow.classList.add('boot-opened');

        // Use the same two-phase animation as window-manager.js
        systemFolderWindow.classList.add('is-opening');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                systemFolderWindow.classList.remove('is-opening');
                systemFolderWindow.classList.add('is-open');
            });
        });
    }

    // Hide the cursor
    function hideCursor() {
        bootCursor.classList.add('boot-cursor--hidden');
        setTimeout(() => {
            bootCursor.style.display = 'none';
        }, 300);
    }

    // Main boot sequence
    async function runBootSequence() {
        // Get terminal lines
        const lines = bootScreen.querySelectorAll('.boot-screen__line');
        const progressContainer = bootScreen.querySelector('.boot-screen__progress');
        const progressBar = bootScreen.querySelector('.boot-screen__progress-bar');

        // Desktop and menu bar are already hidden via CSS classes

        // Small initial delay
        await delay(300);

        // Type each message with delays
        for (let i = 0; i < messages.length; i++) {
            await typeMessage(lines[i], messages[i], 25);
            await delay(400);
        }

        // Show and fill progress bar
        progressContainer.classList.add('boot-screen__progress--visible');
        await delay(100);
        progressBar.classList.add('boot-screen__progress-bar--filling');

        // Wait for progress bar to fill
        await delay(1100);

        // Fade out boot screen
        bootScreen.classList.add('boot-screen--hidden');

        // Reveal desktop
        await delay(200);
        if (desktop) {
            desktop.classList.remove('desktop--hidden');
            desktop.classList.add('desktop--revealing');
        }
        if (menuBar) {
            menuBar.classList.add('menu-bar--revealing');
            menuBar.classList.remove('menu-bar--hidden');
        }

        // Wait for desktop to fully appear
        await delay(500);

        // Animate cursor to icon
        await animateCursor(desktopIcon);

        // Click the icon
        await simulateClick(desktopIcon);

        // Open the window
        await delay(100);
        openSystemFolder();

        // Hide cursor
        await delay(200);
        hideCursor();

        // Mark boot as complete
        markBooted();

        // Clean up classes
        setTimeout(() => {
            if (desktop) desktop.classList.remove('desktop--revealing');
        }, 400);
    }

    // Utility: delay helper
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        if (shouldSkipBoot()) {
            skipBoot();
        } else {
            runBootSequence();
        }
    }
})();
