class TextOverlay {
    constructor(scene) {
        this.scene = scene;
        this.textObject = null;
        this.bgObject = null;
        this.isShowing = false;
        this.typewriterTimer = null;
    }

    show(message, options = {}) {
        if (this.isShowing) this.hideImmediate();

        const {
            duration = 4000,
            typewriter = true,
            y = 50,
            fontSize = '20px'
        } = options;

        this.isShowing = true;

        // Background bar
        this.bgObject = this.scene.add.rectangle(
            GAME_WIDTH / 2, y, GAME_WIDTH - 80, 44, 0x000000, 0.6
        ).setScrollFactor(0).setDepth(150).setAlpha(0);

        this.scene.tweens.add({
            targets: this.bgObject,
            alpha: 1,
            duration: 300
        });

        // Text
        this.textObject = this.scene.add.text(GAME_WIDTH / 2, y, '', {
            fontSize: fontSize,
            fontFamily: 'Caveat, cursive',
            color: '#ffffff',
            wordWrap: { width: GAME_WIDTH - 120 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(151).setAlpha(0);

        if (typewriter) {
            this.textObject.setAlpha(1);
            this.typewriterEffect(message, () => {
                // After typing finishes, wait then fade out
                this.scene.time.delayedCall(duration, () => {
                    this.hide();
                });
            });
        } else {
            this.textObject.setText(message);
            this.scene.tweens.add({
                targets: this.textObject,
                alpha: 1,
                duration: 300
            });

            this.scene.time.delayedCall(duration, () => {
                this.hide();
            });
        }
    }

    typewriterEffect(message, onComplete) {
        let index = 0;
        this.typewriterTimer = this.scene.time.addEvent({
            delay: 35,
            callback: () => {
                index++;
                this.textObject.setText(message.substring(0, index));
                if (index >= message.length) {
                    this.typewriterTimer.remove();
                    if (onComplete) onComplete();
                }
            },
            repeat: message.length - 1
        });
    }

    hide() {
        if (!this.isShowing) return;
        this.isShowing = false;

        const targets = [this.textObject, this.bgObject].filter(Boolean);
        this.scene.tweens.add({
            targets: targets,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.hideImmediate();
            }
        });
    }

    hideImmediate() {
        if (this.typewriterTimer) {
            this.typewriterTimer.remove();
            this.typewriterTimer = null;
        }
        if (this.textObject) {
            this.textObject.destroy();
            this.textObject = null;
        }
        if (this.bgObject) {
            this.bgObject.destroy();
            this.bgObject = null;
        }
        this.isShowing = false;
    }
}
