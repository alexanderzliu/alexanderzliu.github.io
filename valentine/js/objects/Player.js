class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player-idle');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setSize(24, 56);
        this.body.setOffset(12, 8);

        // Keyboard input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys('W,A,S,D');
        this.spaceBar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Touch input flags
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
    }

    update() {
        const onGround = this.body.blocked.down;

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.A.isDown || this.touchLeft) {
            this.setVelocityX(-PLAYER_SPEED);
            this.setFlipX(true);
            if (onGround) this.anims.play('walk', true);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown || this.touchRight) {
            this.setVelocityX(PLAYER_SPEED);
            this.setFlipX(false);
            if (onGround) this.anims.play('walk', true);
        } else {
            this.setVelocityX(0);
            if (onGround) this.anims.play('idle', true);
        }

        // Jump
        const jumpPressed = this.cursors.up.isDown || this.wasd.W.isDown ||
            this.spaceBar.isDown || this.touchJump;
        if (jumpPressed && onGround) {
            this.setVelocityY(JUMP_VELOCITY);
        }

        // In-air appearance
        if (!onGround) {
            this.anims.stop();
            this.setTexture('player-jump');
        }
    }
}
