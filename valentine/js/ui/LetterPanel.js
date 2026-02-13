class LetterPanel {
    constructor(scene) {
        this.scene = scene;
        this.elements = [];
    }

    show(itemName, message, onDismiss) {
        // Dark overlay
        const overlay = this.scene.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6
        ).setDepth(200).setScrollFactor(0).setAlpha(0);
        this.elements.push(overlay);

        // Paper background — slightly rotated for handwritten feel
        const paper = this.scene.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, 500, 280, 0xfff8ed, 1
        ).setDepth(201).setScrollFactor(0).setAlpha(0);
        paper.setStrokeStyle(2, 0xd4c5a9);
        paper.rotation = Phaser.Math.DegToRad(Phaser.Math.Between(-1, 2));
        this.elements.push(paper);

        // Item name header
        const header = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, itemName, {
            fontSize: '28px',
            fontFamily: 'Caveat, cursive',
            color: '#ff6b8a'
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0).setAlpha(0);
        this.elements.push(header);

        // Message body
        const body = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
            fontSize: '18px',
            fontFamily: 'Caveat, cursive',
            color: '#4a3728',
            wordWrap: { width: 440 },
            lineSpacing: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0).setAlpha(0);
        this.elements.push(body);

        // "tap to continue" prompt
        const prompt = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, 'tap to continue', {
            fontSize: '14px',
            fontFamily: 'Caveat, cursive',
            color: '#999'
        }).setOrigin(0.5).setDepth(202).setScrollFactor(0).setAlpha(0);
        this.elements.push(prompt);

        // Fade everything in
        this.elements.forEach(el => {
            this.scene.tweens.add({
                targets: el,
                alpha: el === overlay ? 0.6 : 1,
                duration: 400
            });
        });

        // Pulsing prompt
        this.scene.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            delay: 400
        });

        // Dismiss on tap/key after a brief delay
        this.scene.time.delayedCall(600, () => {
            const dismissHandler = () => {
                this.dismiss(onDismiss);
            };
            this.scene.input.keyboard.once('keydown', dismissHandler);
            this.scene.input.once('pointerdown', dismissHandler);
        });
    }

    dismiss(callback) {
        this.elements.forEach(el => {
            this.scene.tweens.add({
                targets: el,
                alpha: 0,
                duration: 300,
                onComplete: () => el.destroy()
            });
        });
        this.elements = [];

        this.scene.time.delayedCall(350, () => {
            if (callback) callback();
        });
    }
}
