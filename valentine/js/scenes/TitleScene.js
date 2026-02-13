class TitleScene extends Phaser.Scene {
    constructor() {
        super(SCENES.TITLE);
    }

    getUrlParams() {
        const search = window.location.search || '';
        if (search) return new URLSearchParams(search);

        const hash = window.location.hash || '';
        const qIndex = hash.indexOf('?');
        if (qIndex >= 0) return new URLSearchParams(hash.slice(qIndex));

        return new URLSearchParams('');
    }

    resolveSceneParam(value) {
        if (!value) return null;
        const v = String(value).trim().toLowerCase();
        if (!v) return null;

        const map = {
            '1': SCENES.BERKELEY,
            berkeley: SCENES.BERKELEY,
            bk: SCENES.BERKELEY,
            '2': SCENES.SF,
            sf: SCENES.SF,
            sanfrancisco: SCENES.SF,
            'san-francisco': SCENES.SF,
            '3': SCENES.JAPAN,
            japan: SCENES.JAPAN,
            '4': SCENES.UTAH,
            utah: SCENES.UTAH,
            '5': SCENES.SPACE,
            space: SCENES.SPACE,
            finale: SCENES.FINALE
        };

        return map[v] || null;
    }

    create() {
        // Convenience: allow jumping directly to a scene, e.g. `?edit=1&scene=japan`
        try {
            const params = this.getUrlParams();
            const requested = this.resolveSceneParam(params.get('scene') || params.get('level'));
            const edit = params.has('edit') && params.get('edit') !== '0';
            const target = requested || (edit ? SCENES.BERKELEY : null);
            if (target) {
                this.scene.start(target);
                return;
            }
        } catch {
            // ignore
        }

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
        this.add.text(GAME_WIDTH / 2, 140, 'Bubu and Dudu\'s Great Adventure', {
            fontSize: '44px',
            fontFamily: 'Caveat, cursive',
            color: '#ff6b8a',
            stroke: '#2d0a1a',
            strokeThickness: 4
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
