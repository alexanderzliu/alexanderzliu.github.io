// Icon dragging functionality
let draggingIcon = null;
let iconDragOffset = { x: 0, y: 0 };
let iconStartPos = { x: 0, y: 0 };
let iconHasMoved = false;
const ICON_DRAG_THRESHOLD = 5;

// Track if a drag just occurred (to prevent click)
window.iconDragOccurred = false;

// Initialize drag handlers for all icons
function initIconDrag() {
    document.querySelectorAll('.desktop-icon, .folder-icon').forEach(icon => {
        icon.addEventListener('mousedown', handleMouseDown);

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

document.addEventListener('mousemove', e => {
    if (!draggingIcon) return;

    const dx = e.clientX - iconStartPos.x;
    const dy = e.clientY - iconStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if we've moved past the drag threshold
    if (!iconHasMoved && distance < ICON_DRAG_THRESHOLD) return;

    if (!iconHasMoved) {
        // First time crossing threshold - initialize drag
        iconHasMoved = true;
        window.iconDragOccurred = true;
        draggingIcon.classList.add('is-dragging');

        // For folder icons, convert ALL icons in container to absolute positioning
        // This prevents grid reflow when one icon is moved
        if (draggingIcon.classList.contains('folder-icon')) {
            const container = draggingIcon.closest('.folder-icons');

            if (!container.classList.contains('folder-icons--positioned')) {
                // First drag in this container - position all icons absolutely
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
        }
    }

    // Calculate new position
    let x = e.clientX - iconDragOffset.x;
    let y = e.clientY - iconDragOffset.y;

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
        const relX = e.clientX - containerRect.left - iconDragOffset.x;
        const relY = e.clientY - containerRect.top - iconDragOffset.y;

        // Constrain to container bounds
        const maxX = container.offsetWidth - draggingIcon.offsetWidth;
        const maxY = container.offsetHeight - draggingIcon.offsetHeight;

        draggingIcon.style.left = Math.max(0, Math.min(relX, maxX)) + 'px';
        draggingIcon.style.top = Math.max(0, Math.min(relY, maxY)) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    if (draggingIcon) {
        draggingIcon.classList.remove('is-dragging');
        draggingIcon = null;
    }
    iconHasMoved = false;
});

// Initialize when DOM is ready
initIconDrag();
