class WorldUIScene extends Phaser.Scene {
    constructor() {
        super({key: 'worldUi'});
    }

    init(player) {
        this.player = player;
    }

    create() {
        this.cameras.main.setSize(GAME_WIDTH - CAMERA_WIDTH, CAMERA_HEIGHT);
        this.cameras.main.setPosition(CAMERA_WIDTH, 100);
    }
}