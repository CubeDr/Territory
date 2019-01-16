class Engine extends Phaser.Scene {
    constructor() {
        super({key: 'engine'});
    }

    init(player) {
        this.player = player;
    }

    create() {
        this.scene.launch('territory', player.territories[0]);
    }
}