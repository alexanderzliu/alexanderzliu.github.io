// Icon dragging functionality with touch support
let draggingIcon = null;
let iconDragOffset = { x: 0, y: 0 };
let iconStartPos = { x: 0, y: 0 };
let iconHasMoved = false;
const ICON_DRAG_THRESHOLD = 5;

// Long-press state for touch
let longPressTimer = null;
let longPressTriggered = false;
const LONG_PRESS_DELAY = 500;

// Track if a drag just occurred (to prevent click)
window.iconDragOccurred = false;

function getDistanceFromStart(point) {
    const dx = point.x - iconStartPos.x;
    const dy = point.y - iconStartPos.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Initialize drag handlers for all icons
function initIconDrag() {
    document.querySelectorAll('.desktop-icon, .folder-icon').forEach(icon => {
        // Mouse: immediate drag
        icon.addEventListener('mousedown', handleMouseDown);

        // Touch: long-press to initiate drag
        icon.addEventListener('touchstart', handleTouchStart, { passive: false });

        // Prevent link navigation after drag for <a> tags
        if (icon.tagName === 'A') {
            icon.addEventListener('click', e => {
                if (window.iconDragOccurred) {
                    e.preventDefault();
                    window.iconDragOccurred = false;
                }
            });
        }
    });
}

function handleMouseDown(e) {
    // Ignore right-clicks
    if (e.button !== 0) return;

    const icon = e.currentTarget;
    draggingIcon = icon;
    iconHasMoved = false;
    window.iconDragOccurred = false;

    // Store starting mouse position for threshold check
    iconStartPos.x = e.clientX;
    iconStartPos.y = e.clientY;

    // Calculate offset from icon's top-left corner
    const rect = icon.getBoundingClientRect();
    iconDragOffset.x = e.clientX - rect.left;
    iconDragOffset.y = e.clientY - rect.top;

    e.preventDefault();
}

function handleTouchStart(e) {
    const icon = e.currentTarget;
    longPressTriggered = false;

    const point = TouchUtils.getPoint(e);
    iconStartPos.x = point.x;
    iconStartPos.y = point.y;

    const rect = icon.getBoundingClientRect();
    iconDragOffset.x = point.x - rect.left;
    iconDragOffset.y = point.y - rect.top;

    // Start long-press timer
    longPressTimer = setTimeout(() => {
        longPressTriggered = true;
        draggingIcon = icon;
        iconHasMoved = false;
        icon.classList.add('is-long-pressing');

        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(50);
    }, LONG_PRESS_DELAY);
}

// Shared function to initialize folder icon absolute positioning
function initializeFolderIconPositioning() {
    if (!draggingIcon || !draggingIcon.classList.contains('folder-icon')) return;

    const container = draggingIcon.closest('.folder-icons');
    if (!container || container.classList.contains('folder-icons--positioned')) return;

    // Convert ALL icons in container to absolute positioning
    // This prevents grid reflow when one icon is moved
    const icons = container.querySelectorAll('.folder-icon');
    const containerRect = container.getBoundingClientRect();

    // Step 1: Capture ALL positions before any DOM changes
    const positions = Array.from(icons).map(icon => {
        const rect = icon.getBoundingClientRect();
        return {
            icon,
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top
        };
    });

    // Step 2: Apply positions to all icons
    positions.forEach(({ icon, left, top }) => {
        icon.style.left = left + 'px';
        icon.style.top = top + 'px';
        icon.classList.add('folder-icon--positioned');
    });

    container.classList.add('folder-icons--positioned');
}

// Shared function to activate drag mode
function activateDragMode() {
    iconHasMoved = true;
    window.iconDragOccurred = true;
    draggingIcon.classList.remove('is-long-pressing');
    draggingIcon.classList.add('is-dragging');
    initializeFolderIconPositioning();
}

// Shared function to position the dragging icon
function positionDraggingIcon(point) {
    if (!draggingIcon) return;

    let x = point.x - iconDragOffset.x;
    let y = point.y - iconDragOffset.y;

    // Constrain based on icon type
    if (draggingIcon.classList.contains('desktop-icon')) {
        // Desktop icons constrained to viewport
        x = Math.max(0, Math.min(x, window.innerWidth - draggingIcon.offsetWidth));
        y = Math.max(20, Math.min(y, window.innerHeight - draggingIcon.offsetHeight));

        // Update position (desktop icons use fixed positioning)
        draggingIcon.style.left = x + 'px';
        draggingIcon.style.top = y + 'px';
        draggingIcon.style.right = 'auto';
    } else {
        // Folder icons constrained to their container
        const container = draggingIcon.closest('.folder-icons');
        const containerRect = container.getBoundingClientRect();

        // Convert to container-relative coordinates
        const relX = point.x - iconDragOffset.x - containerRect.left;
        const relY = point.y - iconDragOffset.y - containerRect.top;

        // Constrain to container bounds
        const maxX = container.offsetWidth - draggingIcon.offsetWidth;
        const maxY = container.offsetHeight - draggingIcon.offsetHeight;

        draggingIcon.style.left = Math.max(0, Math.min(relX, maxX)) + 'px';
        draggingIcon.style.top = Math.max(0, Math.min(relY, maxY)) + 'px';
    }
}

function handleTouchMove(e) {
    const point = TouchUtils.getPoint(e);
    const distance = getDistanceFromStart(point);

    // Cancel long-press if moved before timer fires
    if (!longPressTriggered && distance > ICON_DRAG_THRESHOLD) {
        clearTimeout(longPressTimer);
        return;
    }

    // Only drag if long-press activated
    if (!longPressTriggered || !draggingIcon) return;

    e.preventDefault();

    if (!iconHasMoved) {
        activateDragMode();
    }

    positionDraggingIcon(point);
}

function handleIconDragEnd() {
    clearTimeout(longPressTimer);
    if (draggingIcon) {
        draggingIcon.classList.remove('is-dragging', 'is-long-pressing');
        draggingIcon = null;
    }
    longPressTriggered = false;
    iconHasMoved = false;
}

function handleMouseMove(e) {
    if (!draggingIcon) return;

    const point = { x: e.clientX, y: e.clientY };
    const distance = getDistanceFromStart(point);

    if (!iconHasMoved && distance < ICON_DRAG_THRESHOLD) return;

    if (!iconHasMoved) {
        activateDragMode();
    }

    positionDraggingIcon(point);
}

// Global event handlers
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('mouseup', handleIconDragEnd);
document.addEventListener('touchend', handleIconDragEnd);
document.addEventListener('touchcancel', handleIconDragEnd);

// Initialize when DOM is ready
initIconDrag();
