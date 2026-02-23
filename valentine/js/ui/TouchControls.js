class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        this.buttons = {};
        this._prevJump = false;

        if (this.isTouchDevice) {
            this.createButtons();
        }
    }

    createButtons() {
        const idle = 0.3;
        const pressed = 0.55;
        const depth = 400;
        const btnW = 60;
        const btnH = 44;
        const y = GAME_HEIGHT - 30;
        const pad = 8;

        // Left / Right on bottom-left, Jump on bottom-right
        this.buttons.left = this.createButton(pad + btnW / 2, y, btnW, btnH, '\u25C0', depth, idle, pressed);
        this.buttons.right = this.createButton(pad + btnW + pad + btnW / 2, y, btnW, btnH, '\u25B6', depth, idle, pressed);
        this.buttons.jump = this.createButton(GAME_WIDTH - pad - btnW / 2, y, btnW + 10, btnH, '\u25B2', depth, idle, pressed);
    }

    createButton(x, y, w, h, label, depth, idleAlpha, pressedAlpha) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(0xffffff, idleAlpha);
        bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
        bg.setScrollFactor(0).setDepth(depth);

        const zone = this.scene.add.zone(x, y, w, h)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(depth + 1);

        const text = this.scene.add.text(x, y, label, {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2).setAlpha(idleAlpha + 0.15);

        let isPressed = false;

        const drawBg = (alpha) => {
            bg.clear();
            bg.fillStyle(0xffffff, alpha);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
        };

        zone.on('pointerdown', () => {
            isPressed = true;
            drawBg(pressedAlpha);
            text.setAlpha(pressedAlpha + 0.15);
        });
        zone.on('pointerup', () => {
            isPressed = false;
            drawBg(idleAlpha);
            text.setAlpha(idleAlpha + 0.15);
        });
        zone.on('pointerout', () => {
            isPressed = false;
            drawBg(idleAlpha);
            text.setAlpha(idleAlpha + 0.15);
        });

        return {
            bg, zone, text,
            get pressed() { return isPressed; }
        };
    }

    update(player) {
        if (!this.isTouchDevice || !player) return;

        player.touchLeft = this.buttons.left.pressed;
        player.touchRight = this.buttons.right.pressed;

        // Edge-detect jump (press, not hold)
        const jumpDown = this.buttons.jump.pressed;
        if (jumpDown && !this._prevJump) {
            player.touchJump = true;
            this.scene.time.delayedCall(200, () => { player.touchJump = false; });
        }
        this._prevJump = jumpDown;
    }

    setVisible(visible) {
        if (!this.isTouchDevice) return;
        Object.values(this.buttons).forEach(b => {
            b.bg.setVisible(visible);
            b.zone.setVisible(visible);
            b.text.setVisible(visible);
            if (!visible) {
                // Reset pressed state by disabling interactivity briefly
                b.zone.disableInteractive();
            } else {
                b.zone.setInteractive();
            }
        });
    }

    destroy() {
        Object.values(this.buttons).forEach(b => {
            b.bg.destroy();
            b.zone.destroy();
            b.text.destroy();
        });
        this.buttons = {};
    }
}
