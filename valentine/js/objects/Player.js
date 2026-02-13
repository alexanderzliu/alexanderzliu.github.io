class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey) {
        super(scene, x, y, textureKey || 'bubu');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.textureKey = textureKey || 'bubu';
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
        this.prevTouchJump = false;

        // Double jump
        this.maxJumps = 2;
        this.jumpsRemaining = this.maxJumps;

        // Movement profile (defaults match previous behavior)
        this.movementProfile = {
            type: 'direct', // 'direct' | 'ice'
            accel: 0,
            maxSpeed: PLAYER_SPEED,
            drag: 0,
            airDrag: 0
        };

        // Start on idle frame
        this.setFrame(0);
    }

    setMovementProfile(profile) {
        if (!profile) return;
        this.movementProfile = {
            ...this.movementProfile,
            ...profile
        };

        if (typeof this.movementProfile.maxJumps === 'number') {
            this.maxJumps = this.movementProfile.maxJumps;
            this.jumpsRemaining = this.maxJumps;
        }

        if (this.movementProfile.type === 'ice') {
            this.setMaxVelocity(this.movementProfile.maxSpeed, 1000);
            this.setDragX(this.movementProfile.drag);
            this.setDragY?.(0);
        } else if (this.movementProfile.type === 'space') {
            this.setMaxVelocity(this.movementProfile.maxSpeed, 600);
            this.setDragX(this.movementProfile.drag ?? 40);
            this.setDragY?.(this.movementProfile.dragY ?? 10);
        } else {
            this.setMaxVelocity(10000, 10000);
            this.setDragX(0);
            this.setDragY?.(0);
            this.setAccelerationX(0);
        }
    }

    update() {
        const onGround = this.body.blocked.down || this.body.touching.down;
        if (onGround) this.jumpsRemaining = this.maxJumps;

        // Horizontal movement
        const leftDown = this.cursors.left.isDown || this.wasd.A.isDown || this.touchLeft;
        const rightDown = this.cursors.right.isDown || this.wasd.D.isDown || this.touchRight;

        if (this.movementProfile.type === 'ice' || this.movementProfile.type === 'space') {
            const accel = this.movementProfile.accel || 800;
            const drag = onGround ? (this.movementProfile.drag ?? 70) : (this.movementProfile.airDrag ?? 20);
            this.setDragX(drag);

            if (leftDown) {
                this.setAccelerationX(-accel);
                this.setFlipX(false);
            } else if (rightDown) {
                this.setAccelerationX(accel);
                this.setFlipX(true);
            } else {
                this.setAccelerationX(0);
            }

            if (onGround) {
                if (Math.abs(this.body.velocity.x) > 8) this.setFrame(1);
                else this.setFrame(0);
            }
        } else {
            if (leftDown) {
                const maxSpeed = this.movementProfile.maxSpeed || PLAYER_SPEED;
                this.setVelocityX(-maxSpeed);
                this.setFlipX(false);
                if (onGround) this.setFrame(1); // walk frame
            } else if (rightDown) {
                const maxSpeed = this.movementProfile.maxSpeed || PLAYER_SPEED;
                this.setVelocityX(maxSpeed);
                this.setFlipX(true);
                if (onGround) this.setFrame(1); // walk frame
            } else {
                this.setVelocityX(0);
                if (onGround) this.setFrame(0); // idle frame
            }
        }

        // Jump
        const keyboardPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.wasd.W) ||
            Phaser.Input.Keyboard.JustDown(this.spaceBar);

        const touchPressed = this.touchJump && !this.prevTouchJump;
        this.prevTouchJump = this.touchJump;

        if ((keyboardPressed || touchPressed) && this.jumpsRemaining > 0) {
            const jumpV = (typeof this.movementProfile.jumpVelocity === 'number')
                ? this.movementProfile.jumpVelocity
                : JUMP_VELOCITY;
            this.setVelocityY(jumpV);
            this.jumpsRemaining -= 1;
        }

        // In-air appearance
        if (!onGround) {
            this.setFrame(2); // jump frame
        }
    }
}
