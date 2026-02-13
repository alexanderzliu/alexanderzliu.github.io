// Game dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;

// Player physics
const PLAYER_SPEED = 200;
const JUMP_VELOCITY = -330;
const GRAVITY = 600;

// Hearts per level
const HEARTS_PER_LEVEL = 5;

// Scene keys
const SCENES = {
    BOOT: 'BootScene',
    TITLE: 'TitleScene',
    BERKELEY: 'Berkeley',
    SF: 'SanFrancisco',
    JAPAN: 'Japan',
    UTAH: 'Utah',
    SPACE: 'Space',
    FINALE: 'FinaleScene'
};

const SCENE_ORDER = [SCENES.BERKELEY, SCENES.SF, SCENES.JAPAN, SCENES.UTAH, SCENES.SPACE, SCENES.FINALE];

// --- Scene data definitions ---
// Max jump height ~90px, max horizontal jump ~220px.

const BERKELEY_DATA = {
    background: 'bg-berkeley',
    groundY: 435,
    platforms: [
        { x: 184, y: 299, width: 300, height: 16 },
        { x: 179, y: 209, width: 180, height: 16 },
        { x: 180, y: 139, width: 170, height: 16 },
        { x: 439, y: 171, width: 70, height: 16 },
        { x: 677, y: 182, width: 140, height: 16 }
    ],
    hearts: [
        { x: 183, y: 278 },
        { x: 183, y: 188 },
        { x: 183, y: 113 },
        { x: 441, y: 143 },
        { x: 676, y: 153 }
    ],
    letterMessage: "Hewwooooooooo. Who would've known there was such a cute Bubu living in Berkeley. I'm glad I stuck around so I could meet the most important person in my life.",
    nextScene: SCENES.SF,
    title: 'Berkeley'
};

const SF_DATA = {
    background: 'bg-sf',
    groundY: 450,
    platforms: [
        { x: 96, y: 273, width: 100, height: 16 },
        { x: 94, y: 215, width: 80, height: 16 },
        { x: 217, y: 215, width: 90, height: 16 },
        { x: 334, y: 215, width: 100, height: 16 },
        { x: 529, y: 326, width: 140, height: 16 }
    ],
    hearts: [
        { x: 96, y: 252 },
        { x: 94, y: 194 },
        { x: 217, y: 194 },
        { x: 334, y: 194 },
        { x: 529, y: 305 }
    ],
    letterMessage: "And now I get to spend everyday with that person! I love you and the little home we've built together!",
    nextScene: SCENES.JAPAN,
    title: 'San Francisco'
};

const JAPAN_DATA = {
    background: 'bg-japan',
    groundY: 355,
    platforms: [
        { x: 153, y: 229, width: 140, height: 16 },
        { x: 153, y: 170, width: 110, height: 16 },
        { x: 353, y: 258, width: 80, height: 16 },
        { x: 351, y: 184, width: 60, height: 16 },
        { x: 540, y: 198, width: 80, height: 16 },
        { x: 352, y: 113, width: 100, height: 16 }
    ],
    hearts: [
        { x: 153, y: 208 },
        { x: 153, y: 149 },
        { x: 353, y: 237 },
        { x: 351, y: 163 },
        { x: 540, y: 177 },
        { x: 352, y: 92 }
    ],
    letterMessage: "And all the adventures we have together. I love exploring new places (sticker shops) near and far.",
    nextScene: SCENES.UTAH,
    title: 'Japan'
};

function generateStairSlopePlatforms(x1, y1, x2, y2, { stepX = 10, height = 16, overlap = 6 } = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(1, Math.ceil(Math.abs(dx) / stepX));
    const width = Math.ceil(Math.abs(dx) / steps) + overlap;

    const platforms = [];
    for (let i = 0; i < steps; i++) {
        const t = (i + 0.5) / steps;
        const x = x1 + (dx * t);
        const surfaceY = y1 + (dy * t);
        platforms.push({
            x: Math.round(x),
            // Convert a "surface" y into rectangle-center y (platforms are stored as centers)
            y: Math.round(surfaceY + (height / 2)),
            width,
            height
        });
    }
    return platforms;
}

function generateHorizontalSurfacePlatform(x1, y, x2, { height = 16 } = {}) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    return {
        x: Math.round((minX + maxX) / 2),
        y: Math.round(y + (height / 2)),
        width: Math.round(maxX - minX),
        height
    };
}

const UTAH_DATA = {
    background: 'bg-utah',
    groundY: 400,
    movement: {
        type: 'ice',
        accel: 800,
        maxSpeed: 260,
        drag: 70,
        airDrag: 20
    },
    // Mountain collision (surface points in art coords):
    // - base:  (150,310) -> (700,310)
    // - left:  (150,310) -> (426,51)
    // - right: (426,51)  -> (700,310)
    // Arcade physics doesn't support rotated bodies, so we approximate slopes with small "stair" platforms.
    platforms: (() => {
        const height = 16;
        const stepX = 10;
        return [
            generateHorizontalSurfacePlatform(150, 310, 700, { height }),
            ...generateStairSlopePlatforms(150, 310, 426, 51, { stepX, height }),
            ...generateStairSlopePlatforms(426, 51, 700, 310, { stepX, height }),

            // Cloud platforms (center coords)
            { x: 115, y: 85, width: 80, height: 16 },
            { x: 397, y: 54, width: 70, height: 16 },
            { x: 483, y: 248, width: 70, height: 16 },
            { x: 479, y: 304, width: 60, height: 16 },
            { x: 647, y: 67, width: 70, height: 16 }
        ];
    })(),
    hearts: [
        { x: 115, y: 64 },
        { x: 397, y: 33 },
        { x: 483, y: 227 },
        { x: 479, y: 283 },
        { x: 647, y: 46 }
    ],
    letterMessage: "Wheeeeeee! I also love getting to do things that I would've never been able to do if it weren't for my bubu",
    nextScene: SCENES.SPACE,
    title: 'Utah'
};

const SPACE_DATA = {
    background: 'bg-space',
    groundY: 410,
    gravityY: 80,
    movement: {
        type: 'space',
        accel: 700,
        maxSpeed: 260,
        drag: 35,
        airDrag: 35,
        dragY: 8,
        jumpVelocity: -230,
        maxJumps: Infinity
    },
    platforms: [],
    hearts: [
        { x: 120, y: 80 },
        { x: 240, y: 250 },
        { x: 430, y: 140 },
        { x: 620, y: 220 },
        { x: 760, y: 95 }
    ],
    letterMessage: "Here's to the future; whereever we end up, near or far. I'll always hold you close.",
    nextScene: SCENES.FINALE,
    title: 'Among the Stars'
};

const SCENE_DATA_MAP = {
    [SCENES.BERKELEY]: BERKELEY_DATA,
    [SCENES.SF]: SF_DATA,
    [SCENES.JAPAN]: JAPAN_DATA,
    [SCENES.UTAH]: UTAH_DATA,
    [SCENES.SPACE]: SPACE_DATA
};

// Initialize game after all scripts load
window.addEventListener('load', () => {
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: GRAVITY },
                debug: false
            }
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [BootScene, TitleScene, Berkeley, SanFrancisco, Japan, Utah, Space, FinaleScene]
    };

    const game = new Phaser.Game(config);
});
