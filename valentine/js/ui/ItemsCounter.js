class ItemsCounter {
    constructor(scene, total) {
        this.scene = scene;
        this.count = 0;
        this.total = total || HEARTS_PER_LEVEL;

        this.text = scene.add.text(20, 16, this.getLabel(), {
            fontSize: '22px',
            fontFamily: 'Caveat, cursive',
            color: '#ff6b8a',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(100);
    }

    getLabel() {
        return '\u2764 ' + this.count + ' / ' + this.total;
    }

    increment() {
        this.count++;
        this.text.setText(this.getLabel());

        // Pop animation
        this.scene.tweens.add({
            targets: this.text,
            scale: 1.4,
            duration: 100,
            yoyo: true
        });
    }
}
