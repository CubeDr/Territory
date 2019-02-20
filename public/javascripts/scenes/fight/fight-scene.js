class FightScene extends Phaser.Scene {
    static get KEY() { return 'fightScene'; }

    constructor() {
        super({KEY: FightScene.KEY});

        this.cameraCenter = {};

        // prepare
        this.state = 0;
    }

    preload() {
        loadTileSprites(this, ["grass"]);
        this.load.image('territory', 'assets/world/tile_territory.png');
        this.load.image('food', 'assets/menu/menu_food.png');
    }

    init(config) {
        this.opponentId = config.opponentId;
        this.armies = config.armies;

        console.log(config);

        doAjax("POST", "player/defence", JSON.stringify({
            idTokenString: gameEngine.idToken,
            opponentId: this.opponentId
        }), (defenceString) => {
            let defenceInfo = JSON.parse(defenceString);
            let boundary = MinimapDialog._getTerritoryBoundary(defenceInfo);
            // extend boundary to fill map
            while(boundary.maxX - boundary.minX + 1 < 8) {
                boundary.maxX++;
                boundary.minX--;
            }
            while(boundary.maxY - boundary.minY + 1 < 8) {
                boundary.maxY++;
                boundary.minY--;
            }
            console.log(boundary);
            this.boundary = boundary;
            this.doCreate();
        });
    }

    create() {
        createAnimations(this, ['grass']);

        this.cameras.main.setPosition(0, 100);
        this.cameras.main.setSize(800, 800);
        this.cameras.main.setBackgroundColor('#000000');
        this.add.text(100, 100, "ASDFASDFASDFSADF");
    }

    doCreate() {
        for(let ty=this.boundary.minY; ty<=this.boundary.maxY; ty++) {
            for(let tx=this.boundary.minX; tx<=this.boundary.maxX; tx++) {
                let x = tx * 100;
                let y = ty * 100;
                let t = this.add.sprite(x, y, 'grassSprite');
                t.anims.load('grassAnim');
                t.anims.play('grassAnim');
            }
        }
        let cx = this.boundary.minX + this.boundary.maxX;
        let cy = this.boundary.minY + this.boundary.maxY;
        this.centerOn(cx * 100 ,cy * 100);
    }

    centerOn(x, y) {
        this.cameraCenter.x = x;
        this.cameraCenter.y = y;
        this.cameras.main.centerOn(x, y);
    }
}