class FightArmyUIScene extends Phaser.Scene {
    static get KEY() { return 'FightArmyUIScene'; }

    constructor() {
        super({key: FightArmyUIScene.KEY});
    }

    preload() {
        // player army animation
        this.load.spritesheet('armySprite', 'assets/sprites/walk_spritesheet.png', { frameWidth: 48, frameHeight: 48});
    }

    init(config) {
        this.armies = config.armies;
        this.onLoad = config.onLoad;
    }

    create() {
        this.cameras.main.setSize(800, 100);
        this.cameras.main.setBackgroundColor('#000000');
        this.createArmies();

        this.indicator = this.add.triangle(0, 0, 0, 0, 10, 0, 5, 10, 0x00ff00);
        this.indicate(0);
        this.onLoad(this);
    }

    createArmies() {
        for(let i=0; i<this.armies.length; i++) {
            let army = this.armies[i];
            let x = 50 + i * 100;
            army.uisprite = this.add.sprite(x, 50, 'armySprite').setScale(1.6).setOrigin(0.5);
            army.uitext = this.add.text(x, 90, army.count.toString() + " / " + army.territory._army.quality)
                .setOrigin(0.5, 0.5);
        }
    }

    indicate(index) {
        if(index == null) {
            this.indicator.visible = false;
            return;
        }
        this.indicator.visible = true;
        this.indicator.setPosition(50 + index * 100, 15);
    }
}