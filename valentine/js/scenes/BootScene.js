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
    }

    create() {
        this.generatePlaceholders();
        this.createAnimations();
        this.registry.set('itemsCollected', 0);
        this.scene.start(SCENES.TITLE);
    }

    generatePlaceholders() {
        // --- Player walk spritesheet (3 frames, 48x64 each) ---
        const walk = this.make.graphics({ add: false });
        for (let i = 0; i < 3; i++) {
            const ox = i * 48;
            walk.fillStyle(0x5b8cff, 1);
            walk.fillRoundedRect(ox + 14, 20, 20, 30, 4);
            walk.fillStyle(0xffd5b4, 1);
            walk.fillCircle(ox + 24, 14, 10);
            walk.fillStyle(0x3d5a99, 1);
            if (i === 0) {
                walk.fillRect(ox + 16, 50, 6, 14);
                walk.fillRect(ox + 26, 50, 6, 14);
            } else if (i === 1) {
                walk.fillRect(ox + 13, 50, 6, 14);
                walk.fillRect(ox + 29, 50, 6, 14);
            } else {
                walk.fillRect(ox + 18, 50, 6, 14);
                walk.fillRect(ox + 24, 50, 6, 14);
            }
        }
        walk.generateTexture('player-walk', 144, 64);
        walk.destroy();
        const walkTex = this.textures.get('player-walk');
        walkTex.add(0, 0, 0, 0, 48, 64);
        walkTex.add(1, 0, 48, 0, 48, 64);
        walkTex.add(2, 0, 96, 0, 48, 64);

        // --- Player idle (2 frames, 48x64 each) ---
        const idle = this.make.graphics({ add: false });
        for (let i = 0; i < 2; i++) {
            const ox = i * 48;
            const bob = i === 0 ? 0 : 1;
            idle.fillStyle(0x5b8cff, 1);
            idle.fillRoundedRect(ox + 14, 20 + bob, 20, 30, 4);
            idle.fillStyle(0xffd5b4, 1);
            idle.fillCircle(ox + 24, 14 + bob, 10);
            idle.fillStyle(0x3d5a99, 1);
            idle.fillRect(ox + 17, 50 + bob, 6, 14);
            idle.fillRect(ox + 25, 50 + bob, 6, 14);
        }
        idle.generateTexture('player-idle', 96, 64);
        idle.destroy();
        const idleTex = this.textures.get('player-idle');
        idleTex.add(0, 0, 0, 0, 48, 64);
        idleTex.add(1, 0, 48, 0, 48, 64);

        // --- Player jump (single frame) ---
        const jump = this.make.graphics({ add: false });
        jump.fillStyle(0x5b8cff, 1);
        jump.fillRoundedRect(14, 18, 20, 30, 4);
        jump.fillStyle(0xffd5b4, 1);
        jump.fillCircle(24, 12, 10);
        jump.fillStyle(0x3d5a99, 1);
        jump.fillRect(12, 48, 6, 12);
        jump.fillRect(30, 48, 6, 12);
        jump.fillStyle(0x5b8cff, 1);
        jump.fillRect(8, 18, 6, 4);
        jump.fillRect(34, 18, 6, 4);
        jump.generateTexture('player-jump', 48, 64);
        jump.destroy();

        // --- Heart (still used in title screen and finale) ---
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

        // --- Collectible items ---
        // Berkeley: boba tea cup (circle + rectangle)
        const boba = this.make.graphics({ add: false });
        boba.fillStyle(0xc88141, 1);
        boba.fillRect(6, 8, 14, 18);
        boba.fillStyle(0xffeedd, 1);
        boba.fillCircle(13, 8, 8);
        boba.fillStyle(0x553311, 1);
        boba.fillCircle(10, 18, 2);
        boba.fillCircle(16, 16, 2);
        boba.fillCircle(13, 20, 2);
        boba.generateTexture('item-berkeley', 26, 28);
        boba.destroy();

        // SF: golden gate bridge silhouette
        const bridge = this.make.graphics({ add: false });
        bridge.fillStyle(0xff4500, 1);
        bridge.fillRect(4, 4, 3, 20);
        bridge.fillRect(19, 4, 3, 20);
        bridge.fillRect(2, 6, 22, 3);
        bridge.fillRect(2, 14, 22, 3);
        bridge.fillStyle(0xff6633, 1);
        bridge.fillRect(9, 6, 2, 18);
        bridge.fillRect(15, 6, 2, 18);
        bridge.generateTexture('item-sf', 26, 26);
        bridge.destroy();

        // Japan: torii gate
        const torii = this.make.graphics({ add: false });
        torii.fillStyle(0xff2200, 1);
        torii.fillRect(0, 0, 26, 4);
        torii.fillRect(2, 6, 22, 3);
        torii.fillRect(4, 6, 3, 20);
        torii.fillRect(19, 6, 3, 20);
        torii.generateTexture('item-japan', 26, 26);
        torii.destroy();

        // Utah: snowflake (diamond shape)
        const snow = this.make.graphics({ add: false });
        snow.fillStyle(0xaaddff, 1);
        snow.fillTriangle(13, 0, 6, 13, 20, 13);
        snow.fillTriangle(13, 26, 6, 13, 20, 13);
        snow.fillStyle(0xffffff, 1);
        snow.fillCircle(13, 13, 4);
        snow.generateTexture('item-utah', 26, 26);
        snow.destroy();

        // Space: star
        const star = this.make.graphics({ add: false });
        star.fillStyle(0xffdd44, 1);
        star.fillTriangle(13, 0, 9, 10, 17, 10);
        star.fillTriangle(13, 24, 9, 14, 17, 14);
        star.fillTriangle(0, 10, 10, 8, 10, 16);
        star.fillTriangle(26, 10, 16, 8, 16, 16);
        star.fillStyle(0xffffaa, 1);
        star.fillCircle(13, 12, 3);
        star.generateTexture('item-space', 26, 26);
        star.destroy();

        // --- Door / portal ---
        const door = this.make.graphics({ add: false });
        door.fillStyle(0x6644aa, 0.8);
        door.fillRoundedRect(2, 0, 28, 40, 6);
        door.fillStyle(0xaa88ff, 0.6);
        door.fillRoundedRect(6, 4, 20, 32, 4);
        door.fillStyle(0xeeddff, 0.4);
        door.fillCircle(16, 16, 6);
        door.generateTexture('door', 32, 40);
        door.destroy();

        // --- Backgrounds (all 800x450 now) ---
        const bgConfigs = [
            { key: 'bg-title', c1: 0x2d1b3d, c2: 0x4a1942 },
            { key: 'bg-berkeley', c1: 0x1a2a4a, c2: 0x2d4a6a },
            { key: 'bg-sf', c1: 0x2a1a3a, c2: 0x4a2a5a },
            { key: 'bg-japan', c1: 0x3a1a2a, c2: 0x5a2a3a },
            { key: 'bg-utah', c1: 0x1a2a3a, c2: 0x3a4a5a },
            { key: 'bg-space', c1: 0x0a0a1a, c2: 0x1a0a2a },
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

    createAnimations() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
    }
}
