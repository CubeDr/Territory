class WorldUIScene extends Phaser.Scene {
    constructor() {
        super({key: 'worldUi'});

        this.player = null;
        this.currentHover = null;
        this.isScrolling = false;
        this.pointerDownPosition = null;
        this.cameraCenter = {
            current: 0,
            min: 0,
            max: 0
        };
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

        this.cameraCenter.current = this.height/2;
        this.cameraCenter.min = this.height/2;

        this._createTerritoryButtons();
        this._attachMainTouchListener();
    }

    click(item) {
        console.log('Click ' + item);
    }

    _createTerritoryButtons() {
        let offsetX = IMAGE_WIDTH / 2;
        let offsetY = IMAGE_HEIGHT / 2;
        this.player.territories.forEach((t) => {
            // place territory button
            this._addTerritoryButton(t, offsetX, offsetY);
            console.log(offsetY);

            offsetY += IMAGE_HEIGHT + 10; // 10 for gap
        });
        let maxCameraCenter = offsetY - IMAGE_HEIGHT/2 - this.height/2 - 5;
        if(maxCameraCenter > this.cameraCenter.min)
            this.cameraCenter.max = maxCameraCenter;
        else this.cameraCenter.max = this.cameraCenter.min;
    }

    _attachMainTouchListener() {
        let self = this;
        this.input
            .on('pointerdown', (p) => {
                if(this._outOfCamera(p)) return;
                self.pointerDownPosition = {
                    x: p.x,
                    y: p.y
                };
                // console.log("D: " + p.x + ", " + p.y);
            })
            .on('pointerup', (p) => {
                if(!self.pointerDownPosition) return;
                // console.log("U: " + p.x + ", " + p.y);
                // console.log("from " + self.pointerDownPosition.x + ", " + self.pointerDownPosition.y);
                self.pointerDownPosition = null;
                if(self.isScrolling) self._stopScroll();
                else self.click(self.currentHover);
            })
            .on('pointermove', (p) => {
                if(!self.pointerDownPosition) return;
                if(!self.isScrolling) {
                    let d = sqDistance(self.pointerDownPosition, p);
                    if(d >= 25)
                        self._startScroll();
                } else {
                    // scroll
                }
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

    _startScroll() {
        console.log('start scroll');
        this.isScrolling = true;
    }

    _stopScroll() {
        console.log('stop scroll');
        this.isScrolling = false;
    }

    _outOfCamera(p) {
        return p.x < this.x || p.y < this.y || p.x > this.x + this.width || p.y > this.y + this.height;
    }
}