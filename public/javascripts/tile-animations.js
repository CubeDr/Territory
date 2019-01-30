function loadTileSprites(scene, sprites) {
    sprites.forEach(sprite => {
        scene.load.spritesheet(sprite + 'Sprite', 'assets/sprites/' + sprite + '_sprite.png',
            { frameWidth: 100, frameHeight: 100 });
    });
}

function createAnimations(scene, sprites) {
    sprites.forEach(sprite => {
        if(scene.anims.get(sprite + 'Anim')) return
        scene.anims.create({
            key: sprite + 'Anim',
            frameRate: 5,
            repeat: -1,
            frames: scene.anims.generateFrameNumbers(sprite + 'Sprite')
        });
    });
}