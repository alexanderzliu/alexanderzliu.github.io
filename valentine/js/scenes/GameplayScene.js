class GameplayScene extends Phaser.Scene {
    constructor(key) {
        super(key);
    }

    getUrlParams() {
        const search = window.location.search || '';
        if (search) return new URLSearchParams(search);

        const hash = window.location.hash || '';
        const qIndex = hash.indexOf('?');
        if (qIndex >= 0) return new URLSearchParams(hash.slice(qIndex));

        return new URLSearchParams('');
    }

    oneWayPlatformProcess(sprite, platform) {
        if (!sprite?.body || !platform?.body) return true;

        // Only collide when the sprite is falling and is above the platform top.
        const tolerance = 8;
        const spriteBody = sprite.body;
        const platformBody = platform.body;

        if (spriteBody.velocity.y < 0) return false;

        return spriteBody.bottom <= (platformBody.top + tolerance);
    }

    isEditMode() {
        try {
            const params = this.getUrlParams();
            return params.has('edit') && params.get('edit') !== '0';
        } catch {
            return false;
        }
    }

    // Subclasses override this
    getSceneData() {
        throw new Error('Subclass must implement getSceneData()');
    }

    setupPlatformEditor(data) {
        this.selectedPlatform = null;
        const help = this.add.text(12, 12,
            [
                'Platform editor',
                '- Drag platforms to move',
                '- Click to select',
                '- Arrow keys: nudge (Shift = faster)',
                '- S: copy platforms[] to clipboard',
                '- 1-5: switch level (Berk/SF/Japan/Utah/Space)',
                '',
                `Scene: ${this.scene.key}`
            ].join('\n'),
            {
                fontSize: '14px',
                fontFamily: 'monospace',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(1000);

        const selectPlatform = (plat) => {
            if (this.selectedPlatform && this.selectedPlatform !== plat) {
                this.selectedPlatform.setStrokeStyle(2, 0x3aa7ff, 1);
            }
            this.selectedPlatform = plat;
            if (plat) plat.setStrokeStyle(3, 0xffd000, 1);
        };

        this.platformRects.forEach(plat => {
            plat.setInteractive({ draggable: true, useHandCursor: true });
            this.input.setDraggable(plat);
            plat.on('pointerdown', () => selectPlatform(plat));
        });

        const onDrag = (pointer, gameObject, dragX, dragY) => {
            if (!gameObject || !gameObject.body) return;
            gameObject.x = dragX;
            gameObject.y = dragY;
            gameObject.body.updateFromGameObject();
        };
        this.input.on('drag', onDrag);

        const nudge = (dx, dy) => {
            if (!this.selectedPlatform || !this.selectedPlatform.body) return;
            this.selectedPlatform.x += dx;
            this.selectedPlatform.y += dy;
            this.selectedPlatform.body.updateFromGameObject();
        };

        const onKeyDown = (ev) => {
            if (!this.selectedPlatform) return;
            const fast = ev.shiftKey ? 5 : 1;
            if (ev.code === 'ArrowLeft') { ev.preventDefault(); nudge(-fast, 0); }
            if (ev.code === 'ArrowRight') { ev.preventDefault(); nudge(fast, 0); }
            if (ev.code === 'ArrowUp') { ev.preventDefault(); nudge(0, -fast); }
            if (ev.code === 'ArrowDown') { ev.preventDefault(); nudge(0, fast); }
        };
        this.input.keyboard.on('keydown', onKeyDown);

        const onExport = async () => {
            const platforms = this.platformRects
                .slice()
                .sort((a, b) => (a.__platformIndex ?? 0) - (b.__platformIndex ?? 0))
                .map(plat => ({
                    x: Math.round(plat.x / (this.artScaleX || 1)),
                    y: Math.round(plat.y / (this.artScaleY || 1)),
                    width: Math.round(plat.width / (this.artScaleX || 1)),
                    height: Math.round(plat.height / (this.artScaleY || 1))
                }));

            const payload = `platforms: ${JSON.stringify(platforms, null, 4)}`;
            console.log(`[${this.scene.key}] ${payload}`);

            try {
                await navigator.clipboard.writeText(payload);
                help.setText(help.text + '\n\nCopied to clipboard.');
            } catch {
                help.setText(help.text + '\n\nCopy failed; check console.');
            }
        };
        this.input.keyboard.on('keydown-S', onExport);

        const switchTo = (sceneKey) => {
            if (!sceneKey || sceneKey === this.scene.key) return;
            this.scene.start(sceneKey);
        };
        const onSwitchKeys = (ev) => {
            if (ev.code === 'Digit1') switchTo(SCENES.BERKELEY);
            if (ev.code === 'Digit2') switchTo(SCENES.SF);
            if (ev.code === 'Digit3') switchTo(SCENES.JAPAN);
            if (ev.code === 'Digit4') switchTo(SCENES.UTAH);
            if (ev.code === 'Digit5') switchTo(SCENES.SPACE);
        };
        this.input.keyboard.on('keydown', onSwitchKeys);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off('drag', onDrag);
            this.input.keyboard.off('keydown', onKeyDown);
            this.input.keyboard.off('keydown', onSwitchKeys);
            this.input.keyboard.off('keydown-S', onExport);
        });

        selectPlatform(this.platformRects[0] || null);
    }

    create() {
        const data = this.getSceneData();
        this.transitioning = false;
        this.inputPaused = false;
        this.heartsCollectedThisLevel = 0;
        this.totalHeartsThisLevel = data.hearts.length;
        this.editMode = this.isEditMode();

        // Fade in
        TransitionFX.fadeIn(this);

        // Background (art may not be 800x450, so we map "art coords" -> world coords)
        const bgTexture = this.textures.get(data.background);
        const bgSource = bgTexture.getSourceImage();
        const artWidth = bgSource.naturalWidth || bgSource.width || GAME_WIDTH;
        const artHeight = bgSource.naturalHeight || bgSource.height || GAME_HEIGHT;
        this.artScaleX = artWidth ? (GAME_WIDTH / artWidth) : 1;
        this.artScaleY = artHeight ? (GAME_HEIGHT / artHeight) : 1;

        const bg = this.add.image(0, 0, data.background).setOrigin(0, 0);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // World bounds = screen size (no scrolling)
        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.physics.world.gravity.y = (typeof data.gravityY === 'number') ? data.gravityY : GRAVITY;

        // Ground (invisible floor)
        const groundYWorld = data.groundY * this.artScaleY;
        this.ground = this.physics.add.staticGroup();
        const groundRect = this.add.rectangle(
            GAME_WIDTH / 2, groundYWorld + 20, GAME_WIDTH, 40, 0x000000, 0
        );
        this.physics.add.existing(groundRect, true);
        this.ground.add(groundRect);

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        this.platformRects = [];
        data.platforms.forEach(p => {
            const widthWorld = p.width * this.artScaleX;
            const heightWorld = p.height * this.artScaleY;
            const xWorld = p.x * this.artScaleX;
            // Platform x/y values are stored as rectangle centers (Phaser default).
            const yWorld = p.y * this.artScaleY;
            const plat = this.add.rectangle(xWorld, yWorld, widthWorld, heightWorld, 0xffffff, 0.15);
            this.physics.add.existing(plat, true);
            this.platforms.add(plat);
            this.platformRects.push(plat);
        });

        if (this.editMode) {
            this.platformRects.forEach((plat, idx) => {
                plat.__platformIndex = idx;
                plat.setStrokeStyle(2, 0x3aa7ff, 1);
                plat.setFillStyle(0x3aa7ff, 0.12);
            });
            this.setupPlatformEditor(data);
            return;
        }

        // Player (bubu)
        this.player = new Player(
            this,
            60 * this.artScaleX,
            groundYWorld - (50 * this.artScaleY),
            'bubu'
        );
        this.player.setMovementProfile?.(data.movement);
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms, null, this.oneWayPlatformProcess, this);

        // Companion (dudu)
        this.companion = new Companion(
            this,
            30 * this.artScaleX,
            groundYWorld - (50 * this.artScaleY),
            'dudu'
        );
        this.companion.setLeader(this.player);
        this.physics.add.collider(this.companion, this.ground);
        this.physics.add.collider(this.companion, this.platforms, null, this.oneWayPlatformProcess, this);

        // Hearts (collectibles)
        this.heartSprites = this.physics.add.group();
        data.hearts.forEach(h => {
            const xWorld = h.x * this.artScaleX;
            const yWorld = h.y * this.artScaleY;
            const heart = this.physics.add.sprite(xWorld, yWorld, 'heart');
            heart.body.setAllowGravity(false);
            heart.body.moves = false;
            this.heartSprites.add(heart);

            // Bobbing animation with random offset
            this.tweens.add({
                targets: heart,
                y: yWorld - (8 * this.artScaleY),
                duration: Phaser.Math.Between(800, 1200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 500)
            });
        });
        this.physics.add.overlap(this.player, this.heartSprites, this.collectHeart, null, this);

        // Hearts counter (per-level)
        this.heartsCounter = new ItemsCounter(this, this.totalHeartsThisLevel);

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
        if (!this.editMode && (this.transitioning || this.inputPaused)) return;

        if (!this.editMode) {
            this.player?.update?.();
            this.companion?.update?.();
        }

    }

    collectHeart(player, heart) {
        heart.disableBody(true, true);
        this.heartsCollectedThisLevel++;
        this.heartsCounter.increment();

        // Global counter for finale
        const globalCount = (this.registry.get('heartsCollected') || 0) + 1;
        this.registry.set('heartsCollected', globalCount);

        // Sparkle effect
        const sparkle = this.add.image(heart.x, heart.y, 'sparkle').setAlpha(1).setScale(0.5);
        this.tweens.add({
            targets: sparkle,
            alpha: 0,
            scale: 2.5,
            duration: 400,
            onComplete: () => sparkle.destroy()
        });

        // Check if all hearts collected
        if (this.heartsCollectedThisLevel >= this.totalHeartsThisLevel) {
            this.inputPaused = true;
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);

            this.time.delayedCall(500, () => {
                this.letterPanel.show(
                    this.sceneData.title,
                    this.sceneData.letterMessage,
                    () => {
                        // Dismiss letter → go to next level
                        TransitionFX.fadeToScene(this, this.nextScene);
                    }
                );
            });
        }
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
