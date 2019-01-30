function loadTileSprites(scene) {
    scene.load.spritesheet('grassSprite', 'assets/sprites/grass_sprite.png', { frameWidth: 100, frameHeight: 100});
    scene.load.spritesheet('houseSprite', 'assets/sprites/house_sprite.png', { frameWidth: 100, frameHeight: 100});
    scene.load.spritesheet('landmarkSprite', 'assets/sprites/landmark_sprite.png', { frameWidth: 100, frameHeight: 100});
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

    // house animation
    config = {
        key: 'houseAnim',
        frameRate: 5,
        repeat: -1,
        frames: scene.anims.generateFrameNumbers('houseSprite')
    };

    scene.anims.create(config);

    // landmark animation
    config = {
        key: 'landmarkAnim',
        frameRate: 5,
        repeat: -1,
        frames: scene.anims.generateFrameNumbers('landmarkSprite')
    };

    scene.anims.create(config);


}