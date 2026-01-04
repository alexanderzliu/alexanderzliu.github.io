// Last.fm Now Playing Widget
// Config loaded from js/config.js (local) or injected by GitHub Actions (production)

const musicWidget = document.getElementById('window-music');
const musicBtn = document.querySelector('.control-strip__btn:nth-child(4)');

// Toggle music widget on button click
musicBtn.addEventListener('click', () => {
    if (musicWidget.classList.contains('is-open')) {
        musicWidget.classList.remove('is-open');
    } else {
        // Position near the control strip
        musicWidget.style.left = '8px';
        musicWidget.style.bottom = '52px';
        musicWidget.style.top = 'auto';
        musicWidget.classList.add('is-open');
        musicWidget.style.zIndex = ++zIndex;
        fetchNowPlaying();
    }
});

async function fetchNowPlaying() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${CONFIG.LASTFM_USER}&api_key=${CONFIG.LASTFM_API_KEY}&format=json&limit=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.recenttracks && data.recenttracks.track && data.recenttracks.track.length > 0) {
            const track = data.recenttracks.track[0];
            updateWidget(track);
        } else {
            showError('No recent tracks');
        }
    } catch (error) {
        console.error('Last.fm fetch error:', error);
        showError('Could not load');
    }
}

function updateWidget(track) {
    const trackEl = musicWidget.querySelector('.music-widget__track');
    const artistEl = musicWidget.querySelector('.music-widget__artist');
    const albumEl = musicWidget.querySelector('.music-widget__album');
    const indicatorEl = musicWidget.querySelector('.music-widget__live-indicator');

    // Track name and artist
    trackEl.textContent = track.name || 'Unknown Track';
    artistEl.textContent = track.artist['#text'] || 'Unknown Artist';

    // Album art
    const albumArt = track.image && track.image[2] ? track.image[2]['#text'] : null;
    if (albumArt) {
        albumEl.innerHTML = `<img src="${albumArt}" alt="Album art" class="music-widget__album-img">`;
    } else {
        albumEl.innerHTML = '<div class="music-widget__album-placeholder"></div>';
    }

    // Now playing indicator
    const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
    if (isNowPlaying) {
        indicatorEl.classList.add('is-live');
        indicatorEl.textContent = 'Now Playing';
    } else {
        indicatorEl.classList.remove('is-live');
        indicatorEl.textContent = 'Last Played';
    }
}

function showError(message) {
    const trackEl = musicWidget.querySelector('.music-widget__track');
    const artistEl = musicWidget.querySelector('.music-widget__artist');
    trackEl.textContent = message;
    artistEl.textContent = '';
}

// Refresh every 30 seconds if widget is open
setInterval(() => {
    if (musicWidget.classList.contains('is-open')) {
        fetchNowPlaying();
    }
}, 30000);
