class WorldScene extends Phaser.Scene {
    constructor() {
        super({key: 'world'});
    }

    init(player) {
        this.player = player;
    }

    preload() {
        this.load.image('grass', 'assets/grass.jpg');
        this.load.image('post', 'assets/post.png');
        this.load.image('rectangle', 'assets/rectangle.png');
        this.load.image('territory', 'assets/world/territory.png');
        this.load.image('bandit', 'assets/world/bandit.png');

        this.load.image('quality', 'assets/ui/resources/quality.png');
        this.load.image('quantity', 'assets/ui/resources/quantity.png');
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
        this.centerCamera(0, 0);

        player.territories.forEach((t) => {
            this.map[t.y][t.x].over = this.createTile(t.x, t.y, 'territory');
            this.map[t.y][t.x].over.territory = t;
        });

        this.input.on('pointerdown', this.pointerDownHandler, this);
        this.input.on('pointerup', this.pointerUpHandler, this);
        this.input.on('pointermove', this.pointerMoveHandler, this);

        this.createDialogs();
        this.enemies = [];
        this._placeRandomEnemies(100);
    }

    update(time, dt) {
        this.player.update(dt/1000);

        this.updateDialogs();

        this.scene.get('info').showPlayer(this.player);
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

        this.banditDialog = new BanditAttackDialog(this);
        this.add.existing(this.banditDialog);
    }

    _placeRandomEnemies(count) {
        while(count-- > 0) this._placeRandomEnemy();
    }

    _placeRandomEnemy() {
        let x;
        let y;

        do {
            x = Math.floor(Math.random() * WORLD_WIDTH) - Math.floor(WORLD_WIDTH/2);
            y = Math.floor(Math.random() * WORLD_HEIGHT) - Math.floor(WORLD_HEIGHT/2);
        } while(this.map[y][x].over != null);

        let e = this.createTile(x, y, 'bandit', {quantity: 100, quality: 50});
        this.add.existing(e);
        this.map[y][x].over = e;
        this.enemies.push(e);
    }

    updateDialogs() {
        this.territoryDialog.update();
    }

    click(gameObject) {
        if(this.selectBox)
            this.selectBox.destroy();
        if(this.selected === gameObject) {
            // unselect
            if(this.selected.territory) this.territoryDialog.setVisible(false);
            this.selected = null;
        } else {
            // select
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
                    this.closeAllDialog();
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

}