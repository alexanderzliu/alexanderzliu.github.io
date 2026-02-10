class GameplayScene extends Phaser.Scene {
    constructor(key) {
        super(key);
    }

    // Subclasses override this
    getSceneData() {
        throw new Error('Subclass must implement getSceneData()');
    }

    create() {
        const data = this.getSceneData();
        this.transitioning = false;
        this.inputPaused = false;

        // Fade in
        TransitionFX.fadeIn(this);

        // Background
        this.add.image(0, 0, data.background).setOrigin(0, 0);

        // World bounds = screen size (no scrolling)
        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Ground (invisible floor)
        this.ground = this.physics.add.staticGroup();
        const groundRect = this.add.rectangle(
            GAME_WIDTH / 2, data.groundY + 20, GAME_WIDTH, 40, 0x000000, 0
        );
        this.physics.add.existing(groundRect, true);
        this.ground.add(groundRect);

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        data.platforms.forEach(p => {
            const plat = this.add.rectangle(p.x, p.y, p.width, p.height, 0xffffff, 0.15);
            this.physics.add.existing(plat, true);
            this.platforms.add(plat);
        });

        // Player
        this.player = new Player(this, 60, data.groundY - 50);
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms);

        // Single collectible
        this.collectibleSprite = this.physics.add.sprite(
            data.collectible.x, data.collectible.y, data.collectible.texture
        );
        this.collectibleSprite.body.setAllowGravity(false);
        // Bobbing animation
        this.tweens.add({
            targets: this.collectibleSprite,
            y: data.collectible.y - 8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.physics.add.overlap(this.player, this.collectibleSprite, this.collectItem, null, this);

        // Items counter
        this.itemsCounter = new ItemsCounter(this);

        // Letter panel
        this.letterPanel = new LetterPanel(this);

        // Store scene data
        this.sceneData = data;
        this.nextScene = data.nextScene;

        // Show title card
        TransitionFX.showTitle(this, data.title);

        // Mobile touch controls
        this.setupTouchControls();

        // Hint text for first scene
        if (this.scene.key === SCENES.BERKELEY) {
            const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30,
                'Arrow keys / WASD to move, Space / Up to jump', {
                    fontSize: '14px',
                    fontFamily: 'Caveat, cursive',
                    color: '#ffffff',
                    alpha: 0.6
                }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

            this.tweens.add({
                targets: hint,
                alpha: 0,
                delay: 5000,
                duration: 1000
            });
        }
    }

    update() {
        if (this.transitioning || this.inputPaused) return;

        this.player.update();
    }

    collectItem(player, item) {
        item.disableBody(true, true);
        this.itemsCounter.increment();

        // Sparkle effect
        const sparkle = this.add.image(item.x, item.y, 'sparkle').setAlpha(1).setScale(0.5);
        this.tweens.add({
            targets: sparkle,
            alpha: 0,
            scale: 2.5,
            duration: 400,
            onComplete: () => sparkle.destroy()
        });

        // Pause player input and show letter panel
        this.inputPaused = true;
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);

        this.time.delayedCall(500, () => {
            this.letterPanel.show(
                this.sceneData.collectible.name,
                this.sceneData.letterMessage,
                () => this.spawnDoor()
            );
        });
    }

    spawnDoor() {
        this.inputPaused = false;

        const doorPos = this.sceneData.door;
        this.doorSprite = this.physics.add.sprite(doorPos.x, doorPos.y, 'door');
        this.doorSprite.body.setAllowGravity(false);
        this.doorSprite.body.setImmovable(true);

        // Glow/pulse animation
        this.tweens.add({
            targets: this.doorSprite,
            alpha: 0.6,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Overlap to exit scene
        this.physics.add.overlap(this.player, this.doorSprite, () => {
            if (!this.transitioning) {
                TransitionFX.fadeToScene(this, this.nextScene);
            }
        });
    }

    setupTouchControls() {
        // Left third = move left, right third = move right, top area = jump
        const leftZone = this.add.zone(0, GAME_HEIGHT * 0.3, GAME_WIDTH * 0.35, GAME_HEIGHT * 0.7)
            .setOrigin(0, 0).setInteractive().setScrollFactor(0).setDepth(300);
        const rightZone = this.add.zone(GAME_WIDTH * 0.65, GAME_HEIGHT * 0.3, GAME_WIDTH * 0.35, GAME_HEIGHT * 0.7)
            .setOrigin(0, 0).setInteractive().setScrollFactor(0).setDepth(300);

        leftZone.on('pointerdown', () => { this.player.touchLeft = true; });
        leftZone.on('pointerup', () => { this.player.touchLeft = false; });
        leftZone.on('pointerout', () => { this.player.touchLeft = false; });

        rightZone.on('pointerdown', () => { this.player.touchRight = true; });
        rightZone.on('pointerup', () => { this.player.touchRight = false; });
        rightZone.on('pointerout', () => { this.player.touchRight = false; });

        // Tap top portion to jump
        const jumpZone = this.add.zone(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.3)
            .setOrigin(0, 0).setInteractive().setScrollFactor(0).setDepth(300);

        jumpZone.on('pointerdown', () => {
            this.player.touchJump = true;
            this.time.delayedCall(200, () => { this.player.touchJump = false; });
        });
    }
}
