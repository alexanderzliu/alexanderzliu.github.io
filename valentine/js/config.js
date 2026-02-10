// Game dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;

// Player physics
const PLAYER_SPEED = 200;
const JUMP_VELOCITY = -330;
const GRAVITY = 600;

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

// Scene data definitions
const BERKELEY_DATA = {
    background: 'bg-berkeley',
    groundY: 380,
    platforms: [
        { x: 180, y: 320, width: 100, height: 16 },
        { x: 350, y: 270, width: 100, height: 16 },
        { x: 540, y: 220, width: 100, height: 16 }
    ],
    collectible: {
        texture: 'item-berkeley',
        x: 540, y: 190,
        name: 'Boba Tea'
    },
    letterMessage: "Remember our first boba run on Telegraph Ave? I was so nervous I almost spilled mine. You laughed and said it was cute. That's when I knew.",
    door: { x: 720, y: 348 },
    nextScene: SCENES.SF,
    title: 'Berkeley'
};

const SF_DATA = {
    background: 'bg-sf',
    groundY: 380,
    platforms: [
        { x: 200, y: 330, width: 90, height: 16 },
        { x: 360, y: 280, width: 90, height: 16 },
        { x: 520, y: 230, width: 90, height: 16 },
        { x: 660, y: 180, width: 100, height: 16 }
    ],
    collectible: {
        texture: 'item-sf',
        x: 660, y: 150,
        name: 'Golden Gate Sunset'
    },
    letterMessage: "That evening on the bridge, the fog rolling in... you held my hand and everything felt right. The city lights were beautiful, but I was looking at you.",
    door: { x: 720, y: 348 },
    nextScene: SCENES.JAPAN,
    title: 'San Francisco'
};

const JAPAN_DATA = {
    background: 'bg-japan',
    groundY: 380,
    platforms: [
        { x: 200, y: 300, width: 80, height: 16 },
        { x: 400, y: 250, width: 120, height: 16 },
        { x: 600, y: 300, width: 80, height: 16 },
        { x: 400, y: 170, width: 100, height: 16 }
    ],
    collectible: {
        texture: 'item-japan',
        x: 400, y: 140,
        name: 'Paper Crane'
    },
    letterMessage: "Our trip to Japan felt like a dream. The temples, the cherry blossoms, the little streets we got lost in together... I'd get lost with you anywhere.",
    door: { x: 720, y: 348 },
    nextScene: SCENES.UTAH,
    title: 'Japan'
};

const UTAH_DATA = {
    background: 'bg-utah',
    groundY: 380,
    platforms: [
        { x: 150, y: 320, width: 80, height: 16 },
        { x: 300, y: 260, width: 70, height: 16 },
        { x: 450, y: 200, width: 70, height: 16 },
        { x: 580, y: 140, width: 80, height: 16 }
    ],
    collectible: {
        texture: 'item-utah',
        x: 580, y: 110,
        name: 'Snowflake'
    },
    letterMessage: "That snowy mountain morning, just us and the quiet peaks... You said you could stay there forever. I said only if you're there too.",
    door: { x: 720, y: 348 },
    nextScene: SCENES.SPACE,
    title: 'Utah'
};

const SPACE_DATA = {
    background: 'bg-space',
    groundY: 380,
    platforms: [
        { x: 160, y: 310, width: 70, height: 16 },
        { x: 350, y: 250, width: 70, height: 16 },
        { x: 520, y: 310, width: 70, height: 16 },
        { x: 400, y: 170, width: 70, height: 16 },
        { x: 600, y: 120, width: 80, height: 16 }
    ],
    collectible: {
        texture: 'item-space',
        x: 600, y: 90,
        name: 'Shooting Star'
    },
    letterMessage: "If I could give you the stars, I would. But since I can't, I'll give you all the adventures, all the laughter, and all my love — to infinity and beyond.",
    door: { x: 720, y: 348 },
    nextScene: SCENES.FINALE,
    title: 'Among the Stars'
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
