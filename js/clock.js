// Clock - Mac OS 7 style (h:mm AM/PM)
function updateClock() {
    const now = new Date();
    const h = now.getHours() % 12 || 12;
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    document.getElementById('menu-clock').textContent = `${h}:${m} ${ampm}`;
}

updateClock();
setInterval(updateClock, 1000);
