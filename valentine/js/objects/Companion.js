class Companion extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey) {
        super(scene, x, y, textureKey || 'dudu');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setSize(24, 56);
        this.body.setOffset(12, 8);

        // Position history for delayed following
        this.history = [];
        this.historyDelay = 12; // frames of delay
        this.leader = null;

        this.setFrame(0);
    }

    setLeader(player) {
        this.leader = player;
    }

    update() {
        if (!this.leader) return;

        // Record leader state
        this.history.push({
            x: this.leader.x,
            y: this.leader.y,
            velocityX: this.leader.body.velocity.x,
            velocityY: this.leader.body.velocity.y,
            flipX: this.leader.flipX,
            frame: this.leader.frame.name
        });

        // Only follow once we have enough history
        if (this.history.length < this.historyDelay) return;

        // Read delayed state
        const delayed = this.history.shift();
        const onGround = this.body.blocked.down;

        // Follow with offset behind the leader
        const offsetX = this.leader.flipX ? 30 : -30;
        const targetX = delayed.x + offsetX;

        // Move toward target position
        const dx = targetX - this.x;
        if (Math.abs(dx) > 2) {
            this.setVelocityX(Phaser.Math.Clamp(dx * 8, -PLAYER_SPEED, PLAYER_SPEED));
            this.setFlipX(delayed.flipX);
        } else {
            this.setVelocityX(0);
        }

        // Jump when the leader jumped (delayed)
        if (delayed.velocityY < -100 && onGround) {
            this.setVelocityY(JUMP_VELOCITY);
        }

        // Mirror frame
        if (!onGround) {
            this.setFrame(2); // jump
        } else if (Math.abs(this.body.velocity.x) > 10) {
            this.setFrame(1); // walk
        } else {
            this.setFrame(0); // idle
        }
    }
}
