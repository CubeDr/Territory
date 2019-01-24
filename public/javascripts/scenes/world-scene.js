class WorldScene extends Phaser.Scene {
    constructor() {
        super({key: 'world'});
        this._registeredEvents = [];
    }

    init(data) {
        this.player = data.player;

        this.events.on('shutdown', this._shutdown, this);

        this.centerX = data.centerX * IMAGE_WIDTH;
        this.centerY = data.centerY * IMAGE_HEIGHT;
    }

    preload() {
        this.scene.launch('worldUi', this.player);
        if(!this.scene.isActive('info')) this.scene.launch('info', this.player);

        this.load.image('grass', 'assets/tile_grass.jpg');
        this.load.image('post', 'assets/tile_post.png');
        this.load.image('rectangle', 'assets/background_dialog.png');
        this.load.image('territory', 'assets/world/tile_territory.png');
        this.load.image('bandit', 'assets/world/tile_bandit.png');

        this.load.image('quality', 'assets/ui/resources/icon_quality.png');
        this.load.image('quantity', 'assets/ui/resources/icon_quantity.png');

        // player army animation
        this.load.spritesheet('armySprite', 'assets/sprites/walk_spritesheet.png', { frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('armyFightSprite', 'assets/sprites/cloud_spritesheet.png', {frameWidth: 140, frameHeight: 122});
    }

    create() {
        this.map = [];
        for(let y=-parseInt(WORLD_HEIGHT/2); y<=parseInt(WORLD_HEIGHT/2); y++) {
            this.map[y] = [];
            for(let x=-parseInt(WORLD_WIDTH/2); x<=parseInt(WORLD_WIDTH/2); x++)
                this.map[y][x] = this.createTile(x, y, 'grass');
        }

        this.cameras.main.setSize(CAMERA_WIDTH, CAMERA_HEIGHT);
        this.cameras.main.setPosition(0, 100);
        this.centerCamera(this.centerX, this.centerY);

        player.territories.forEach((t) => {
            this.map[t.y][t.x].over = this.createTile(t.x, t.y, 'territory');
            this.map[t.y][t.x].over.territory = t;

            // saves its gameObject to parameter to easily track gameObject from another scene
            t.gameObject = this.map[t.y][t.x].over;
        });

        this.input.on('pointerdown', this.pointerDownHandler, this);
        this.input.on('pointerup', this.pointerUpHandler, this);
        this.input.on('pointermove', this.pointerMoveHandler, this);

        this.enemies = [];
        this._placeRandomEnemies(100);

        this.createDialogs();

        this.engine = this.scene.get('engine');
        this.engine.emit('showInfo', {
            type: 'player',
            data: this.player
        });

        // player army animation sprites
        this.player.runningArmies.forEach((a) => {
            this._createArmyWalking(a);
        });
        let config = {
            frameRate: 6,
            repeat: -1
        };
        // create animations if not already created
        if(!this.anims.get("armyWalkE")) {
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
        }
        this._listen('runArmy', (a) => {
            this._createArmyWalking(a);
        });
    }

    update(time, dt) {
        this._updateArmyWalking();

        this.updateDialogs();
    }

    createTile(x, y, key, config) {
        let tile = this.add.image(x*100, y*100, key);
        tile.mapX = x;
        tile.mapY = y;
        tile.key = key;
        tile.config = config;
        tile.setInteractive();
        return tile;
    }

    createDialogs() {
        this.territoryDialog = new TerritoryEnterDialog(this);
        this.add.existing(this.territoryDialog);
        this.territoryDialog.setDepth(1);

        this.banditDialog = new BanditAttackDialog(this, this.player, (bandit) => {
            this.scene.add(AttackTerritorySelectDialogScene.KEY,
                AttackTerritorySelectDialogScene);
            this.scene.launch(AttackTerritorySelectDialogScene.KEY, {
                player: this.player,
                target: bandit
            });
            if(this.selectBox) this.selectBox.destroy();
            this.closeAllDialog();
            this.selected = null;
        });
        this.add.existing(this.banditDialog);
        this.banditDialog.setDepth(1);
    }

    _placeRandomEnemies(count) {
        this.player.enemies.forEach((enemy) => {
            let e = this.createTile(enemy.x, enemy.y, 'bandit', enemy);
            this.add.existing(e);
            this.map[enemy.y][enemy.x].over = e;
            this.enemies.push(e);
            count--;
        });
        while(count-- > 0) this._placeRandomEnemy();
    }

    _placeRandomEnemy() {
        let x;
        let y;

        do {
            x = Math.floor(Math.random() * WORLD_WIDTH) - Math.floor(WORLD_WIDTH/2);
            y = Math.floor(Math.random() * WORLD_HEIGHT) - Math.floor(WORLD_HEIGHT/2);
        } while(this.map[y][x].over != null);

        let enemy = this.player.getRandomEnemySpec();
        enemy.x = x;
        enemy.y = y;

        let e = this.createTile(x, y, 'bandit', enemy);
        this.add.existing(e);
        this.map[y][x].over = e;
        this.enemies.push(e);

        this.player.enemies.push(enemy);
    }

    updateDialogs() {
        this.territoryDialog.update();
    }

    click(gameObject, center=false) {
        if(this.selectBox)
            this.selectBox.destroy();
        if(this.buildButton)
            this.buildButton.destroy();
        if(this.selected === gameObject) {
            // unselect
            this.closeAllDialog();
            this.selected = null;
        } else {
            // select
            if(center)
                this.cameras.main.pan(gameObject.x, gameObject.y, 80);

            this.selectBox = this.add.graphics();
            this.selectBox.lineStyle(10, 0x8a2be2);
            this.selectBox.strokeRect(gameObject.x - IMAGE_WIDTH/2, gameObject.y - IMAGE_HEIGHT/2,
                IMAGE_WIDTH, IMAGE_HEIGHT);
            this.selected = gameObject;

            switch (gameObject.key) {
                case 'territory':
                    this.closeAllDialog();
                    this.openTerritoryDialog(gameObject);
                    break;
                case 'bandit':
                    this.closeAllDialog();
                    this.openBanditDialog(gameObject);
                    break;
                default:
                    // 빈 토지 클릭
                    this.buildButton = new TextButton(this, gameObject.x, gameObject.y, "개척", {
                        fontSize: 20,
                        onClick: () => {
                            // 나누어 떨어지지만 혹시 몰라 반올림
                            let x = Math.round(gameObject.x / IMAGE_WIDTH);
                            let y = Math.round(gameObject.y / IMAGE_HEIGHT);
                            console.log(x, y);
                            let t = new Territory(this.player, {
                                x: x, y: y
                            });
                            this.player.territories.push(t);

                            this.map[t.y][t.x].over = this.createTile(t.x, t.y, 'territory');
                            this.map[t.y][t.x].over.territory = t;

                            // saves its gameObject to parameter to easily track gameObject from another scene
                            t.gameObject = this.map[t.y][t.x].over;

                            this.unselect();
                        }
                    }).setOrigin(0.5);
                    this.add.existing(this.buildButton);
                    this.closeAllDialog();
                    break;
            }
        }
    }

    pointerDownHandler(pointer) {
        // out of camera
        if(pointer.x >= CAMERA_WIDTH || pointer.y <= IMAGE_HEIGHT) return;

        this.isPointerDown = true;
        this.isDragging = false;
        this.lastPointerPosition = {x: pointer.x, y: pointer.y};
    }

    pointerUpHandler(pointer, gameObject) {
        if(!this.isPointerDown) return;
        this.isPointerDown = false;

        if(!this.isDragging) {
            if (gameObject.length > 0)
                this.click(gameObject[0]);
        } else {
            this.centerX += this.deltaX;
            this.centerY += this.deltaY;
            this.deltaX = 0;
            this.deltaY = 0;
            this.isDragging = false;
        }
    }

    pointerMoveHandler(pointer) {
        if(this.isDragging ||
            (this.isPointerDown && sqDistance(this.lastPointerPosition, pointer) >= 25)) {
            this.isDragging = true;

            this.deltaX = this.lastPointerPosition.x - pointer.x;
            this.deltaY = this.lastPointerPosition.y - pointer.y;

            this.lastPointerPosition.x = pointer.x;
            this.lastPointerPosition.y = pointer.y;

            let newX = clipToRange(this.centerX + this.deltaX,
                (CAMERA_WIDTH - WORLD_WIDTH * IMAGE_WIDTH)/2,
                (WORLD_WIDTH * IMAGE_WIDTH - CAMERA_WIDTH)/2);
            let newY = clipToRange(this.centerY + this.deltaY,
                (CAMERA_HEIGHT - WORLD_HEIGHT * IMAGE_HEIGHT)/2,
                (WORLD_HEIGHT * IMAGE_HEIGHT - CAMERA_HEIGHT)/2);

            this.centerCamera(newX, newY);
        }
    }

    closeAllDialog() {
        this.territoryDialog.setVisible(false);
        this.banditDialog.setVisible(false);
    }

    openTerritoryDialog(gameObject) {
        this.territoryDialog.territory = gameObject.territory;
        this.setDialogPositionRelativeTo(this.territoryDialog, gameObject);
        this.territoryDialog.setVisible(true);
    }

    openBanditDialog(gameObject) {
        this.banditDialog.setBandit(gameObject.config);
        this.setDialogPositionRelativeTo(this.banditDialog, gameObject);
        this.banditDialog.setVisible(true);
    }

    setDialogPositionRelativeTo(dialog, object) {
        if(this.centerX < object.x) {
            // left
            dialog.setPosition(object.x - dialog.width, object.y);
        } else {
            // right
            dialog.setPosition(object.x + dialog.width, object.y);
        }
    }

    centerCamera(x, y) {
        this.centerX = x;
        this.centerY = y;
        this.cameras.main.centerOn(x, y);
    }

    _createArmyWalking(army) {
        let dx = army.to.x - army.from.x;
        let dy = army.to.y - army.from.y;
        let direction = getDirectionName(dx, dy);

        army.sprite = this.add.sprite(army.from.x * IMAGE_WIDTH, army.from.y * IMAGE_HEIGHT, 'armySprite');
        army.sprite.anims.load('armyWalk' + direction);
        army.sprite.anims.play('armyWalk' + direction);
    }

    _createArmyFighting(army) {
        army.to.state = 'fighting';
        army.sprite = [];
        let dx = [-20, 20, -10];
        let dy = [-10, 0, 20];
        for(let i = 0; i < 3; i++) {
            let px = army.to.x * IMAGE_WIDTH + dx[i];
            let py = army.to.y * IMAGE_HEIGHT + dy[i];
            let idx = randInt(0, 18);
            let s = this.add.sprite(px, py, 'armyFightSprite', idx)
                .setScale(0.8);
            army.sprite.push(s);

            this.tweens.add({
                targets: s,
                scaleX: 0.6,
                scaleY: 0.6,
                duration: 1000,
                delay: i * 333,
                repeat: -1,
                yoyo: true,
            });
        }
        this.player.fightingArmies.push(army);

        this.engine.registerFight(army);
        this._listen('fightEnd', (a) => {
            if(a === army) {
                this.player.fightingArmies.splice(
                    this.player.fightingArmies.indexOf(a), 1
                );
                a.sprite.forEach((s) => {
                    s.destroy();
                });
                this.player.enemies.splice(
                    this.player.enemies.indexOf(a.to), 1
                );
                this.map[a.to.y][a.to.x].over.destroy();
                this.map[a.to.y][a.to.x].over = null;
            }
        });
    }

    _updateArmyWalking() {
        let now = Date.now();
        let arrived = [];
        this.player.runningArmies.forEach((a) => {
            let from = {
                x: a.from.x * IMAGE_WIDTH,
                y: a.from.y * IMAGE_HEIGHT
            };
            let to = {
                x: a.to.x * IMAGE_WIDTH,
                y: a.to.y * IMAGE_HEIGHT
            };

            let dt = (now - a.start) / 1000;
            let distance = dt * FIGHT_MOVEMENT_SPEED;
            let direction = normalize(to.x - from.x, to.y - from.y);

            direction.x *= distance;
            direction.y *= distance;
            let position = {
                x: from.x + direction.x,
                y: from.y + direction.y
            };
            if(sqDistance(position, from) >= sqDistance(to, from)) {
                // if arrived
                a.sprite.destroy();
                a.sprite = null;
                arrived.push(a);
            } else {
                // if not arrived, keep on walking
                a.sprite.setPosition(position.x, position.y);
            }
        });

        // delete arrived armies from runningArmies
        arrived.forEach((a) => {
            this.player.runningArmies.splice(
                this.player.runningArmies.indexOf(a), 1
            );
            this._createArmyFighting(a);
        });
    }

    _listen(eventName, callback) {
        this._registeredEvents.push({
            event: eventName,
            callback: callback
        });
        this.engine.on(eventName, callback);
    }

    _shutdown() {
        this._registeredEvents.forEach((e) => {
            this.engine.off(e.event, e.callback)
        });

        this.player.runningArmies.forEach((a) => {
            a.sprite.destroy();
        });

        this.events.off('shutdown', this._shutdown);
    }

    unselect() {
        if(this.selectBox)
            this.selectBox.destroy();
        this.closeAllDialog();
    }
}