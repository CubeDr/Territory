class FightScene extends Phaser.Scene {
    static get KEY() { return 'fightScene'; }

    constructor() {
        super({KEY: FightScene.KEY});

        this.cameraCenter = {};

        // prepare
        this.state = -2;
        this.gain = {
            money: 0,
            food: 0,
            knowhows: []
        };
    }

    preload() {
        loadTileSprites(this, ["grass"]);
        this.load.image('territory', 'assets/world/tile_territory.png');
        this.load.image('tile_food', 'assets/menu/menu_food.png');
        this.load.image('dialog', 'assets/background_dialog.png');
        this.load.image('money', 'assets/ui/resources/icon_coin.png');
        this.load.image('food', 'assets/ui/resources/icon_food.png');
        this.load.image('quality', 'assets/ui/resources/icon_quality.png');
        this.load.image('quantity', 'assets/ui/resources/icon_quantity.png');

        this.load.spritesheet('armySprite', 'assets/sprites/walk_spritesheet.png', { frameWidth: 48, frameHeight: 48});
    }

    init(config) {
        this.opponentId = config.opponentId;
        this.armies = config.armies;

        // Launch FightArmyUi
        this.scene.add(FightArmyUIScene.KEY, FightArmyUIScene);
        this.scene.launch(FightArmyUIScene.KEY, {
            armies: this.armies,
            onLoad: (armyUi) => {
                this.armyUi = armyUi;
                this.armyUi.indicate(this.holdingArmy);
            }
        });
        this.scene.add(FightResourceUIScene.KEY, FightResourceUIScene);
        this.scene.launch(FightResourceUIScene.KEY, {callback: () => { this.endGame(); }});

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
            this.boundary = boundary;
            this.doCreate();
        });
    }

    create() {
        createAnimations(this, ['grass']);

        this.cameras.main.setPosition(0, 100);
        this.cameras.main.setSize(800, 800);
        this.cameras.main.setBackgroundColor('#225500');

        // territory dialog
        this.territoryDialog = new FightTerritoryInfoDialog(this);
        this.territoryDialog.setDepth(1);
        this.territoryDialog.visible = false;
        this.add.existing(this.territoryDialog);

        // Army walking animation
        let config = {
            frameRate: 6,
            repeat: -1
        };
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

        this.resourceUi = this.scene.get(FightResourceUIScene.KEY);
        this.doCreate();

        this.input
            .on('gameobjectover', this.gameObjectOver, this)
            .on('gameobjectout', this.gameObjectOut, this)
            .on('gameobjectdown', this.gameObjectDown, this);
        this.input.keyboard.on('keydown', (e) => {
            try {
                let i = parseInt(e.key) - 1;
                if(i < this.armies.length) this.select(i);
            } catch (e) {

            }
        });
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

            let tile = this.add.image(x, y, t.quantity>0?'territory':'tile_food');
            t.tile = tile;
            tile.tileType = t.quantity>0?'defence':'resource';
            tile.territory = t;

            this.map[t.y][t.x].over = tile;

            tile.setInteractive()
                .on('pointermove', (p, lx, ly) => {
                    let x = tile.x + lx - tile.width/2;
                    let y = tile.y + ly - tile.height/2;
                    this.territoryDialog.setPosition(x, y);
                    if(tile.tileType === 'defence')
                        this.territoryDialog.showDefenceInfo(t.quantity, t.quality);
                    else this.territoryDialog.showResourceInfo(t.money, t.food);
                })
                .on('pointerout', () => {
                    this.territoryDialog.visible = false;
                });
        });

        this.placeArmy();
    }

    update(time, dt) {
        this.moveArmies(dt);
        this.fightArmies(dt);
    }

    centerOn(x, y, pan=false) {
        this.cameraCenter.x = x;
        this.cameraCenter.y = y;
        if(pan) this.cameras.main.pan(x, y, 80);
        else this.cameras.main.centerOn(x, y);
    }

    placeArmy(index=0) {
        if(this.infoText != null) this.infoText.destroy();
        this.infoText = this.add.text(this.cameraCenter.x, this.cameraCenter.y - 300,
            '병력을 배치시킬 곳을 선택해주세요.', {fontSize: 20})
            .setOrigin(0.5, 0);
        this.hold = this.add.sprite(0, 0, 'armySprite');
        this.hold.setAlpha(0.5);
        this.hold.visible = false;
        this.holdingArmy = index;

        if(this.armyUi) this.armyUi.indicate(index);
    }

    gameObjectOver(p, go) {
        switch(this.state) {
            case 0:
                if(go.tileType !== 'grass') break;
                if(go.over != null) {
                    this.hold.visible = false;
                    break;
                }
                this.hold.visible = true;
                this.hold.setPosition(go.x, go.y);
                break;
        }
    }

    gameObjectOut(p, go) {

    }

    gameObjectDown(p, go) {
        switch(this.state) {
            case 0:
                if(go.tileType !== 'grass') break;
                if(go.over != null) break;
                this.hold.visible = false;

                let sprite = this.add.sprite(go.x, go.y, 'armySprite');
                sprite.tileType = 'army';
                sprite.setInteractive();
                sprite.index = this.holdingArmy;
                this.armies[this.holdingArmy].sprite = sprite;
                if(this.holdingArmy < this.armies.length - 1) this.placeArmy(this.holdingArmy + 1);
                else this.startGame();
                break;
            case 1:
                switch(go.tileType) {
                    case 'army': this.select(go.index); break;
                    case 'grass': this.move(this.selectedArmyIndex, go.x, go.y); break;
                    case 'defence':
                        let armyIdx = this.selectedArmyIndex;
                        this.move(armyIdx, go.x, go.y, false, () => {
                            this.move(armyIdx, go.x, go.y, false, () => {
                                this.startFight(armyIdx, go.territory);
                            }, false);
                        }); break;
                        break;
                    case 'resource':
                        this.move(this.selectedArmyIndex, go.x, go.y);
                        break;
                }
                break;
        }
    }

    startGame() {
        this.cameras.main.setZoom(1);
        this.state = 1;
        this.infoText.setText("");
        this.select(0);
    }

    select(armyIndex) {
        if(this.selectedArmyIndex != null)
            this.armies[this.selectedArmyIndex].sprite.clearTint();

        if(armyIndex == null) {
            this.armyUi.indicate(null);
            this.selectedArmyIndex = null;
            return;
        }

        let army = this.armies[armyIndex];

        if(army.dead) return;
        this.selectedArmyIndex = armyIndex;

        army.sprite.setTint(0x99ff99);
        this.armyUi.indicate(armyIndex);

        this.cameras.main.pan(army.sprite.x, army.sprite.y, 80);
    }

    move(armyIndex, x, y, containLast=true, doneListener=()=>{}, diagonal=true) {
        if(armyIndex == null) return;
        this.stopFight(armyIndex);

        let army = this.armies[armyIndex];

        // calculate path
        let start = {
            x: Math.round(army.sprite.x / 100) - this.boundary.minX,
            y: Math.round(army.sprite.y / 100) - this.boundary.minY
        };
        let end = {
            x: Math.round(x / 100) - this.boundary.minX,
            y: Math.round(y / 100) - this.boundary.minY
        };
        let path = this.getPath(start, end, containLast, diagonal).map((n) => {
            return {
                x: (n.x + this.boundary.minX) * 100,
                y: (n.y + this.boundary.minY) * 100
            }
        });
        if(!containLast && path.length > 0) path.splice(path.length-1, 1);

        // move
        army.path = path;
        army.doneListener = doneListener;
    }

    getPath(start, end, containLast, diagonal) {
        let mapGrid = this.getMapGrid();
        if(!containLast) mapGrid[end.y][end.x] = 1;
        let graph = new Graph(mapGrid, { diagonal: diagonal });
        start = graph.grid[start.y][start.x];
        end = graph.grid[end.y][end.x];
        let nodes = astar.search(graph, start, end, { heuristic: astar.heuristics.diagonal });
        return nodes.map((node) => {
            return {
                x: node.y,
                y: node.x
            };
        });
    }

    getMapGrid() {
        let grid = [];
        for(let y=this.boundary.minY; y<=this.boundary.maxY; y++) {
            let row = [];
            for(let x=this.boundary.minX; x<=this.boundary.maxX; x++) {
                if(this.map[y][x].over!= null && this.map[y][x].over.tileType==='defence') row.push(0);
                else row.push(1);
            }
            grid.push(row);
        }
        return grid;
    }

    moveArmies() {
        let speed = 0.5;

        this.armies.forEach((a) => {
            if(a.path == null || a.path.length === 0) {
                if(a.doneListener) {
                    a.direction = null;
                    a.sprite.anims.stop();
                    a.uisprite.anims.stop();
                    let listener = a.doneListener;
                    a.doneListener = null;
                    listener();
                }
                return;
            }
            let sprite = a.sprite;
            let target = a.path[0];


            let d = normalize(
                target.x - sprite.x,
                target.y - sprite.y
            );
            d.x *= speed;
            d.y *= speed;


            let n = normalize(
                target.x - sprite.x - d.x,
                target.y - sprite.y - d.y
            );

            if(d.x * n.x + d.y * n.y <= 0) {
                // 경유지 도착
                sprite.setPosition(target.x, target.y);
                a.path.splice(0, 1);
            } else {
                // 이동중
                sprite.setPosition(sprite.x + d.x, sprite.y + d.y);
            }

            // move animation
            let directionName = getDirectionName(d.x, d.y);
            if(directionName !== a.direction) {
                a.direction = directionName;
                // start animation
                sprite.anims.load('armyWalk' + directionName);
                sprite.anims.play('armyWalk' + directionName);
                a.uisprite.anims.load('armyWalk' + directionName);
                a.uisprite.anims.play('armyWalk' + directionName);
            }

            // 해당 영지의 식량 획듯
            let x = Math.round(sprite.x / 100);
            let y = Math.round(sprite.y / 100);
            if(this.map[y][x].over != null) {
                let tile = this.map[y][x].over;
                if(tile.tileType === 'resource') {
                    this.gain.money += tile.territory.money;
                    this.gain.food += tile.territory.food;
                    this.resourceUi.showResource(this.gain.money, this.gain.food);

                    this.map[y][x].over = null;
                    tile.destroy();
                }
            }
        })
    }

    fightArmies(dt) {
        this.armies.filter((a) => { return a.target != null; }).forEach((a) => {
            a.duration += dt;
            if(a.duration < 125) this.setFightEffect(a);
            else if(a.duration < 250) this.clearFightEffect(a);
            else if(a.duration < 375) this.setFightEffect(a);
            else if(a.duration < 1000) this.clearFightEffect(a);
            else {
                // fight logic
                let qp = a.territory._army.quality / a.target.quality;

                // 병력 감소량 계산
                let aDec = 1;
                let tDec = 1;
                if(qp <= 1) {
                    // 플레이어가 더 병질이 높은 경우
                    aDec = qp;
                    tDec = 1;
                } else {
                    // 상대방이 더 병질이 높은 경우
                    aDec = 1;
                    tDec = qp;
                }

                a.count -= aDec;
                a.uitext.setText(Math.ceil(a.count) + " / " + a.territory._army.quality);
                a.target.quantity -= tDec;

                if(a.target.quantity <= 0) {
                    // Destroy target
                    let tile = a.target.tile;
                    tile.setTexture("tile_food");
                    tile.tileType = "resource";

                    a.target = null;
                }
                if(a.count <= 0) {
                    // Destroy army
                    if(a === this.armies[this.selectedArmyIndex]) {
                        this.select(null);
                    }
                    a.sprite.destroy();
                    a.target = null;
                    a.dead = true;
                    a.uitext.setText("");
                    a.uisprite.setAlpha(0.5);

                    if(this.armies.filter((a) => { return a.dead !== true; }).length === 0)
                        this.endGame();
                }

                a.duration = 0;
            }
        });
    }

    setFightEffect(a) {
        a.sprite.setTint(0xff0000);
        a.target.tile.setTint(0xff0000);
    }

    clearFightEffect(a) {
        if(a === this.armies[this.selectedArmyIndex])
            a.sprite.setTint(0x99ff99);
        else a.sprite.clearTint();
        if(a.target) a.target.tile.clearTint();
    }

    startFight(armyIndex, defence) {
        let army = this.armies[armyIndex];
        let direction = getDirectionName(defence.x - army.sprite.x, defence.y - army.sprite.y);
        army.sprite.anims.load('armyWalk' + direction);
        army.sprite.anims.play('armyWalk' + direction);
        army.sprite.anims.stop();
        army.uisprite.anims.load('armyWalk' + direction);
        army.uisprite.anims.play('armyWalk' + direction);
        army.uisprite.anims.stop();

        army.target = defence;
        army.duration = 0;
    }

    stopFight(armyIndex) {
        let army = this.armies[armyIndex];
        this.clearFightEffect(army);
        army.target = null;
        army.duration = 0;
    }

    endGame() {
        gameEngine.player.deltaMoney(this.gain.money);
        gameEngine.player.deltaFood(this.gain.food);
        gameEngine.uploadUser();

        this.gain.knowhows.forEach((id) => {
            gameEngine.player.learn(id);
        });

        this.scene.add(FightEndDialogScene.KEY, FightEndDialogScene);
        this.scene.launch(FightEndDialogScene.KEY, {
            callback: () => {
                this.scene.remove(FightScene.KEY);
                this.scene.remove(FightArmyUIScene.KEY);
                this.scene.remove(FightResourceUIScene.KEY);
            },
            money: this.gain.money,
            food: this.gain.food,
            knowhows: this.gain.knowhows
        });
    }
}