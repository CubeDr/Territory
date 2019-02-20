class FightScene extends Phaser.Scene {
    static get KEY() { return 'fightScene'; }

    constructor() {
        super({KEY: FightScene.KEY});

        this.cameraCenter = {};

        // prepare
        this.state = -2;
    }

    preload() {
        loadTileSprites(this, ["grass"]);
        this.load.image('territory', 'assets/world/tile_territory.png');
        this.load.image('tile_food', 'assets/menu/menu_food.png');
        this.load.image('dialog', 'assets/background_dialog.png');
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
            this.territories = defenceInfo;

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

        // territory dialog
        let d = this.add.container();
        d.setDepth(1);

        let back = this.add.nineslice(0, 0, 200, 100, 'dialog', 10, 10);
        d.add(back);

        this.territoryDialog = d;

        this.doCreate();
    }

    doCreate() {
        if(++this.state < 0) return;
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
        // Zoom out to match boundary
        let width = this.boundary.maxX - this.boundary.minX + 1;
        let height = this.boundary.maxY - this.boundary.minY + 1;
        let scale = width > height? width : height;
        scale = 8 / scale;
        this.cameras.main.setZoom(scale);

        this.territories.forEach((t) => {
            let x = t.x * 100;
            let y = t.y * 100;

            let tile = this.add.image(x, y, t.quantity>0?'territory':'tile_food');
            t.tile = tile;
            tile.territory = t;

            tile.setInteractive()
                .on('pointerover', () => {
                    this.territoryDialog.visible = true;
                })
                .on('pointermove', (p, lx, ly) => {
                    let x = tile.x + lx - tile.width/2;
                    let y = tile.y + ly - tile.height/2;
                    this.territoryDialog.setPosition(x, y);
                })
                .on('pointerout', () => {
                    this.territoryDialog.visible = false;
                });
        });
    }

    centerOn(x, y) {
        this.cameraCenter.x = x;
        this.cameraCenter.y = y;
        this.cameras.main.centerOn(x, y);
    }
}