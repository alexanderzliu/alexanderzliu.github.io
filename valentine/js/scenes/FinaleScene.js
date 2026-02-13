class FinaleScene extends Phaser.Scene {
    constructor() {
        super(SCENES.FINALE);
    }

    create() {
        TransitionFX.fadeIn(this, 1200);

        // Background
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-finale').setOrigin(0.5);

        // Sequenced romantic messages
        const messages = [
            { text: 'From Berkeley to the stars', delay: 1500 },
            { text: 'You\'ll always be in my heart', delay: 4500 },
            { text: 'All the memories we\'ve made', delay: 8000 },
            { text: 'A love that will never fade', delay: 11500 },
            { text: 'Happy Valentine\'s Day', delay: 14500, fontSize: '40px', color: '#ff6b8a' },
            { text: 'I love you.', delay: 18000, fontSize: '30px' }
        ];

        messages.forEach(m => {
            this.time.delayedCall(m.delay, () => {
                const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, m.text, {
                    fontSize: m.fontSize || '24px',
                    fontFamily: 'Caveat, cursive',
                    color: m.color || '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                }).setOrigin(0.5).setAlpha(0);

                this.tweens.add({
                    targets: text,
                    alpha: 1,
                    y: GAME_HEIGHT / 2 - 15,
                    duration: 800,
                    hold: 2500,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            });
        });

        // Heart rain starts partway through
        this.time.delayedCall(12000, () => {
            this.add.particles(0, -20, 'heart', {
                x: { min: 0, max: GAME_WIDTH },
                y: -20,
                speedY: { min: 30, max: 80 },
                speedX: { min: -15, max: 15 },
                scale: { min: 0.3, max: 0.8 },
                alpha: { start: 0.7, end: 0 },
                lifespan: 6000,
                frequency: 250,
                quantity: 2,
                rotate: { min: -30, max: 30 }
            });
        });

        // Show total hearts collected
        this.time.delayedCall(21000, () => {
            const count = this.registry.get('heartsCollected') || 0;
            const totalHearts = (SCENE_ORDER || [])
                .filter(k => k !== SCENES.FINALE)
                .reduce((sum, k) => sum + ((SCENE_DATA_MAP?.[k]?.hearts?.length) || 0), 0);
            const itemText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50,
                '\u2764 ' + count + ' / ' + totalHearts + ' hearts collected \u2764', {
                    fontSize: '20px',
                    fontFamily: 'Caveat, cursive',
                    color: '#ffaacc'
                }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: itemText,
                alpha: 1,
                duration: 1000
            });
        });

        // Allow restart after finale
        this.time.delayedCall(23000, () => {
            const restartText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20,
                'Tap or press any key to play again', {
                    fontSize: '14px',
                    fontFamily: 'Caveat, cursive',
                    color: '#ffffff'
                }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: restartText,
                alpha: 0.5,
                duration: 800,
                yoyo: true,
                repeat: -1
            });

            this.input.keyboard.once('keydown', () => this.restart());
            this.input.once('pointerdown', () => this.restart());
        });
    }

    restart() {
        this.registry.set('heartsCollected', 0);
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.TITLE);
        });
    }
}
