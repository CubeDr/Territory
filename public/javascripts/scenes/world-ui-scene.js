class WorldUIScene extends Phaser.Scene {
    constructor() {
        super({key: 'worldUi'});

        this.player = null;
        this.currentHover = null;
        this.isScrolling = false;
    }

    preload() {
        this.load.image('w_territory', 'assets/world/territory.png');
        this.load.image('button', 'assets/ui/button.png');
    }

    init(player) {
        this.player = player;
    }

    create() {
        this.cameras.main.setSize(GAME_WIDTH - CAMERA_WIDTH, CAMERA_HEIGHT);
        this.cameras.main.setPosition(CAMERA_WIDTH, 100);

        let offsetX = IMAGE_WIDTH / 2;
        let offsetY = IMAGE_HEIGHT / 2;
        this.player.territories.forEach((t) => {
            // place territory button
            this._addTerritoryButton(t, offsetX, offsetY);

            offsetY += IMAGE_HEIGHT + 10; // 10 for gap
        });
    }

    _addTerritoryButton(territory, x, y) {
        this.add.image(x, y, 'button').setScale(0.95);
        this.add.image(x, y, 'w_territory').setScale(0.85);
    }
}