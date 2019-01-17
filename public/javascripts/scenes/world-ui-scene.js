class WorldUIScene extends Phaser.Scene {
    constructor() {
        super({key: 'worldUi'});

        this.player = null;
        this.currentHover = null;
        this.isScrolling = false;
        this.isPointerDown = false;
    }

    preload() {
        this.load.image('w_territory', 'assets/world/territory.png');
        this.load.image('button', 'assets/ui/button.png');
    }

    init(player) {
        this.player = player;
    }

    create() {
        this.x = CAMERA_WIDTH;
        this.y = 100;
        this.width = GAME_WIDTH - CAMERA_WIDTH;
        this.height = CAMERA_HEIGHT;
        this.cameras.main.setSize(this.width, this.height);
        this.cameras.main.setPosition(this.x, this.y);

        this._createTerritoryButtons();
        this._attachMainTouchListener();
    }

    _createTerritoryButtons() {
        let offsetX = IMAGE_WIDTH / 2;
        let offsetY = IMAGE_HEIGHT / 2;
        this.player.territories.forEach((t) => {
            // place territory button
            this._addTerritoryButton(t, offsetX, offsetY);

            offsetY += IMAGE_HEIGHT + 10; // 10 for gap
        });
    }

    _attachMainTouchListener() {
        let self = this;
        this.input
            .on('pointerdown', (p) => {
                if(this._outOfCamera(p)) return;
                self.isPointerDown = true;
                console.log("D: " + p.x + ", " + p.y);
            })
            .on('pointerup', (p) => {
                if(!self.isPointerDown) return;
                self.isPointerDown = false;
                console.log("U: " + p.x + ", " + p.y);
            })
            .on('pointermove', (p) => {
                if(!self.isPointerDown) return;
                console.log("M: " + p.x + ", " + p.y);
            });
    }

    _addTerritoryButton(territory, x, y) {
        let c = this.add.container(x, y);
        c.add(this.add.image(0, 0, 'button').setScale(0.95));
        c.add(this.add.image(0, 0, 'w_territory').setScale(0.85));
        c.territory = territory;

        let self = this;
        let width = IMAGE_WIDTH * .95;
        let height = IMAGE_HEIGHT * .95;
        c.setInteractive(
            new Phaser.Geom.Rectangle(-width/2, -height/2, width, height),
            Phaser.Geom.Rectangle.Contains)
            .on('pointerover', () => {
                self.currentHover = c;
                c.iterate((c) => c.setTint(0xaaaaaa));
            })
            .on('pointerout', () => {
                self.currentHover = null;
                c.iterate((c) => c.clearTint());
            })
            .on('pointerdown', () => {
                if(self.currentHover !== c) return;
                c.iterate((c) => c.setTint(0x999999));
            })
            .on('pointerup', () => {
                if(self.currentHover !== c) return;
                c.iterate((c) => c.setTint(0xaaaaaa));
            });
    }

    _outOfCamera(p) {
        return p.x < this.x || p.y < this.y || p.x > this.x + this.width || p.y > this.y + this.height;
    }
}