class TitleScene extends Phaser.Scene {
    constructor() {
        super(SCENES.TITLE);
    }

    create() {
        this.cameras.main.fadeIn(800, 0, 0, 0);

        // Background
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg-title').setOrigin(0.5);

        // Floating hearts decoration
        for (let i = 0; i < 12; i++) {
            const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
            const y = Phaser.Math.Between(50, GAME_HEIGHT - 50);
            const heart = this.add.image(x, y, 'heart')
                .setAlpha(0.15)
                .setScale(Phaser.Math.FloatBetween(0.5, 1.5));

            this.tweens.add({
                targets: heart,
                y: y - Phaser.Math.Between(15, 40),
                alpha: 0.08,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Title
        this.add.text(GAME_WIDTH / 2, 140, 'Happy Valentine\'s Day', {
            fontSize: '44px',
            fontFamily: 'Caveat, cursive',
            color: '#ff6b8a',
            stroke: '#2d0a1a',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(GAME_WIDTH / 2, 200, 'A little adventure for us', {
            fontSize: '22px',
            fontFamily: 'Caveat, cursive',
            color: '#ffb8c6'
        }).setOrigin(0.5);

        // Start prompt
        const prompt = this.add.text(GAME_WIDTH / 2, 340, 'Press any key or tap to start', {
            fontSize: '18px',
            fontFamily: 'Caveat, cursive',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Input handlers
        this.input.keyboard.once('keydown', () => this.startGame());
        this.input.once('pointerdown', () => this.startGame());
    }

    startGame() {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(SCENES.BERKELEY);
        });
    }
}
