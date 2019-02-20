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

        this.load.spritesheet('armySprite', 'assets/sprites/walk_spritesheet.png', { frameWidth: 48, frameHeight: 48});

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

        // territory dialog
        let d = this.add.container();
        d.setDepth(1);

        let back = this.add.nineslice(0, 0, 200, 100, 'dialog', 10, 10);
        d.add(back);
        d.visible = false;

        this.territoryDialog = d;

        // Army walking animation
        let direction = ["E", "N", "NE", "NW", "S", "SE", "SW", "W"];
        for(let d=0; d<8; d++) {
            config.key = "armyWalk" + direction[d];
            config.frames = [];
            for(let i=0; i<8; i++)
                config.frames.push({
                    key: 'armySprite',
                    frame: d*8 + i
                });
            this.anims.create(config);
        }

        this.doCreate();

        this.input
            .on('gameobjectover', this.gameObjectOver, this)
            .on('gameobjectout', this.gameObjectOut, this)
            .on('gameobjectdown', this.gameObjectDown, this);
    }

    doCreate() {
        if(++this.state < 0) return;

        // create grass
        this.map = {};
        for(let ty=this.boundary.minY; ty<=this.boundary.maxY; ty++) {
            this.map[ty] = {};
            for(let tx=this.boundary.minX; tx<=this.boundary.maxX; tx++) {
                let x = tx * 100;
                let y = ty * 100;
                let t = this.add.sprite(x, y, 'grassSprite');
                t.anims.load('grassAnim');
                t.anims.play('grassAnim');
                t.tileType = 'grass';
                this.map[ty][tx] = t;
                t.setInteractive();
            }
        }

        // set camera to see whole map
        let cx = this.boundary.minX + this.boundary.maxX;
        let cy = this.boundary.minY + this.boundary.maxY;
        this.centerOn(cx * 100 ,cy * 100);
        // Zoom out to match boundary
        let width = this.boundary.maxX - this.boundary.minX + 1;
        let height = this.boundary.maxY - this.boundary.minY + 1;
        let scale = width > height? width : height;
        scale = 8 / scale;
        this.cameras.main.setZoom(scale);

        // create territories
        this.territories.forEach((t) => {
            let x = t.x * 100;
            let y = t.y * 100;

            t.tileType = t.quantity>0?'defence':'resource';
            let tile = this.add.image(x, y, t.quantity>0?'territory':'tile_food');
            t.tile = tile;
            tile.territory = t;

            this.map[t.y][t.x].over = tile;

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

        // Launch FightArmyUi
        this.scene.add(FightArmyUIScene.KEY, FightArmyUIScene);
        this.scene.launch(FightArmyUIScene.KEY, {
            armies: this.armies
        });

        this.infoText = this.add.text(this.cameraCenter.x, this.cameraCenter.y - 300,
            '병력을 배치시킬 곳을 선택해주세요.', {fontSize: 20})
            .setOrigin(0.5, 0);
        this.hold = this.add.sprite(0, 0, 'armySprite');
        this.hold.setAlpha(0.5);
        this.hold.visible = false;
    }

    centerOn(x, y) {
        this.cameraCenter.x = x;
        this.cameraCenter.y = y;
        this.cameras.main.centerOn(x, y);
    }

    gameObjectOver(p, go) {
        switch(this.state) {
            case 0:
                if(go.tileType !== 'grass') break;
                if(go.over != null) break;
                this.hold.visible = true;
                this.hold.setPosition(go.x, go.y);
                break;
        }
    }

    gameObjectOut(p, go) {

    }

    gameObjectDown(p, go) {

    }
}