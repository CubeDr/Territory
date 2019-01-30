function loadTileSprites(scene) {
    scene.load.spritesheet('grassSprite', 'assets/sprites/grass_sprite.png', { frameWidth: 100, frameHeight: 100});
}

function createAnimations(scene) {
    // do not load animations twice
    if(scene.anims.get('grassAnim')) return;

    // grass animation
    let config = {
        key: 'grassAnim',
        frameRate: 5,
        repeat: -1,
        frames: scene.anims.generateFrameNumbers('grassSprite')
    };

    scene.anims.create(config);


}