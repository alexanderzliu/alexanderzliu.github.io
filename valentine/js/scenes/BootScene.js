class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENES.BOOT);
    }

    preload() {
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Loading...', {
            fontSize: '24px',
            fontFamily: 'Caveat, cursive',
            color: '#ff6b8a'
        }).setOrigin(0.5);

        // Load backgrounds
        this.load.image('bg-berkeley', 'assets/backgrounds/bg-berkeley.png');
        this.load.image('bg-sf', 'assets/backgrounds/bg-sf.png');
        this.load.image('bg-japan', 'assets/backgrounds/bg-japan.png');
        this.load.image('bg-utah', 'assets/backgrounds/bg-utah.png');
        this.load.image('bg-space', 'assets/backgrounds/bg-space.png');

        // Load character spritesheets (3 frames: idle, walk, jump)
        this.load.spritesheet('bubu', 'assets/sprites/bubu.png', {
            frameWidth: 48, frameHeight: 64
        });
        this.load.spritesheet('dudu', 'assets/sprites/dudu.png', {
            frameWidth: 48, frameHeight: 64
        });
    }

    create() {
        this.generatePlaceholders();
        this.registry.set('heartsCollected', 0);
        this.scene.start(SCENES.TITLE);
    }

    generatePlaceholders() {
        // --- Heart ---
        const heart = this.make.graphics({ add: false });
        heart.fillStyle(0xff4466, 1);
        heart.fillCircle(8, 8, 7);
        heart.fillCircle(18, 8, 7);
        heart.fillTriangle(1, 10, 25, 10, 13, 24);
        heart.generateTexture('heart', 26, 26);
        heart.destroy();

        // --- Sparkle ---
        const sparkle = this.make.graphics({ add: false });
        sparkle.fillStyle(0xffff88, 1);
        sparkle.fillTriangle(8, 0, 6, 6, 10, 6);
        sparkle.fillTriangle(8, 16, 6, 10, 10, 10);
        sparkle.fillTriangle(0, 8, 6, 6, 6, 10);
        sparkle.fillTriangle(16, 8, 10, 6, 10, 10);
        sparkle.generateTexture('sparkle', 16, 16);
        sparkle.destroy();

        // --- Title and finale backgrounds (procedural, no custom art) ---
        const bgConfigs = [
            { key: 'bg-title', c1: 0x2d1b3d, c2: 0x4a1942 },
            { key: 'bg-finale', c1: 0x1a0a1a, c2: 0x2d0a2d }
        ];

        bgConfigs.forEach(bg => {
            const g = this.make.graphics({ add: false });
            g.fillStyle(bg.c1, 1);
            g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            g.fillStyle(bg.c2, 0.5);
            g.fillRect(0, GAME_HEIGHT * 0.4, GAME_WIDTH, GAME_HEIGHT * 0.6);
            g.fillStyle(0x2a2a2a, 0.3);
            g.fillRect(0, GAME_HEIGHT - 70, GAME_WIDTH, 70);
            g.generateTexture(bg.key, GAME_WIDTH, GAME_HEIGHT);
            g.destroy();
        });
    }
}
