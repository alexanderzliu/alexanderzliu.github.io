class TransitionFX {
    static fadeToScene(scene, nextSceneKey, duration = 800) {
        scene.transitioning = true;
        if (scene.player) scene.player.setVelocityX(0);

        scene.cameras.main.fadeOut(duration, 0, 0, 0);
        scene.cameras.main.once('camerafadeoutcomplete', () => {
            scene.scene.start(nextSceneKey);
        });
    }

    static fadeIn(scene, duration = 800) {
        scene.cameras.main.fadeIn(duration, 0, 0, 0);
    }

    static showTitle(scene, title, callback) {
        const text = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, title, {
            fontSize: '36px',
            fontFamily: 'Caveat, cursive',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setAlpha(0).setDepth(200);

        scene.tweens.add({
            targets: text,
            alpha: 1,
            duration: 600,
            hold: 2000,
            yoyo: true,
            onComplete: () => {
                text.destroy();
                if (callback) callback();
            }
        });
    }
}
