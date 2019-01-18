class AttackTerritorySelectDialogScene extends Phaser.Scene {
    static get KEY() { return 'attackTerritorySelectDialog'; }

    constructor() {
        super({key: AttackTerritorySelectDialogScene.KEY});
        this.currentHover = null;
        this.list = null;
        this.listX = CAMERA_WIDTH/2;
        this.listY = CAMERA_HEIGHT/3 + 20;
        this.listW = 290;
        this.listH = 340;
        this.isScrolling = false;
        this.lastPointerPosition = null;
        this.scrollOffset = {
            current: 0,
            min: 0,
            max: 0
        };
    }

    init(player) {
        this.player = player;
    }

    preload() {
        this.load.image('item_back', 'assets/ui/list_item_back.png');
        this.load.image('icon', 'assets/ui/territory_icon.png');
        this.load.image('quantity_icon', 'assets/ui/resources/quantity.png');
        this.load.image('quality_icon', 'assets/ui/resources/quality.png');
    }

    create() {
        let g = this.add.graphics();
        g.fillStyle(0x000000, 0.7);
        g.fillRect(0, IMAGE_HEIGHT, GAME_WIDTH, CAMERA_HEIGHT);

        let textX = CAMERA_WIDTH / 2;
        let textY = CAMERA_HEIGHT / 3;
        // title text
        let title = this.add.text(textX, textY, "병력을 출진시킬 영지를 선택하세요").setOrigin(0.5, 1);
        // set dialog modal
        title.setInteractive(new Phaser.Geom.Rectangle(), () => { return true; });

        let fightableTerritories = this._getFightableTerritories();
        this.list = this._buildList(fightableTerritories);

        this._buildButtons();

        this.input
            .on('pointerdown', (p) => {
                if(!this._isInList(p.x, p.y)) return;
                this.lastPointerPosition = {
                    x: p.x,
                    y: p.y
                };
            }, this)
            .on('pointerup', (p) => {
                if(!this.lastPointerPosition) return;
                this.lastPointerPosition = null;
                if(this.currentHover) {
                    this.currentHover.iterate((c) => {
                        c.clearTint();
                    });
                    this.currentHover = null;
                }
                if(this.isScrolling) {
                    // stop scrolling
                    this.isScrolling = false;
                }
            }, this)
            .on('pointermove', (p) => {
                if(!this.lastPointerPosition) return;
                if(!this.isScrolling) {
                    let d = sqDistance(this.lastPointerPosition, p);
                    if(d >= 25) {
                        // start scrolling
                        this.isScrolling = true;
                    }
                } else {
                    if(!p.isDown) {
                        // end scrolling
                        this.isScrolling = false;
                    }
                    let deltaY = this.lastPointerPosition.y - p.y;

                    this.lastPointerPosition.y = p.y;
                    this.list.iterate((item) => {
                        item.setPosition(item.x, item.y - deltaY);
                    });
                }
            }, this);
    }

    _getFightableTerritories() {
        let ts = [];
        this.player.territories.forEach((t) => {
            if(t.army.quantity !== 0) ts.push(t);
        });
        return ts;
    }

    _buildList(territoryList) {
        let list = this.add.container(this.listX, this.listY);

        // Adding territories to the list
        let originX = -this.listW/2;

        let offsetY = 0;
        territoryList.forEach((t) => {
            var item = this.add.container(0, 0);

            var background = this.add.image(0, 0, 'item_back').setOrigin(0.5, 0);
            item.add(background);

            var icon = this.add.image(0, 0, 'icon').setOrigin(0);
            item.add(icon);
            icon.setPosition(originX + 8, 8);

            var text = this.add.text(0, 0, '영지(' + t.x + ", " + t.y + ")")
                .setOrigin(0, 0.5);
            item.add(text);
            text.setPosition(originX + 74,  20);

            var quantityIcon = this.add.image(0, 0, 'quantity_icon').setOrigin(0);
            item.add(quantityIcon);
            quantityIcon.setPosition(originX + 74, 36);

            var quantityText = this.add.text(0, 0, t.army.quantity, {fontSize:20}).setOrigin(0, 0.5);
            item.add(quantityText);
            quantityText.setPosition(originX + 109, 51);

            var qualityIcon = this.add.image(0, 0, 'quality_icon').setOrigin(0);
            item.add(qualityIcon);
            qualityIcon.setPosition(originX + 177, 36);

            var qualityText = this.add.text(0, 0, t.army.quality, {fontSize:20}).setOrigin(0, 0.5);
            item.add(qualityText);
            qualityText.setPosition(originX + 212, 51);

            item.setInteractive(
                new Phaser.Geom.Rectangle(originX, 0, 290, 74),
                Phaser.Geom.Rectangle.Contains
            )
                .on('pointerdown', (p, x, y) => {
                    if(!this._isInList(p.x, p.y)) return;
                    item.iterate((c) => {
                        c.setTint(0x999999);
                    });
                })
                .on('pointerup', (p, x, y) => {
                    if(!this._isInList(p.x, p.y)) return;
                    item.iterate((c) => {
                        c.clearTint();
                    });
                })
                .on('pointerover', (p, x, y) => {
                    if(!this._isInList(p.x, p.y)) return;
                    this.currentHover = item;
                    item.iterate((c) => {
                        c.setTint(0xaaaaaa);
                    });
                })
                .on('pointerout', (p, x, y) => {
                    if(!this._isInList(p.x, p.y)) return;
                    this.currentHover = null;
                    item.iterate((c) => {
                        c.clearTint();
                    });
                });

            list.add(item);
            item.setPosition(0, offsetY);
            offsetY += 85;
        });

        // Masking list
        let g = this.make.graphics();
        g.fillStyle(0xffffff);
        g.fillRect(this.listX - this.listW/2, this.listY, this.listW, this.listH);
        list.mask = g.createGeometryMask();

        return list;
    }

    _buildButtons() {
        let btnConfirm = new TextButton(this,
            CAMERA_WIDTH/2 - 50, CAMERA_HEIGHT * 4 / 5, "확인", {
                onClick: () => {
                    if(this.isScrolling) return;
                }
            }).setOrigin(1, 0.5);
        this.add.existing(btnConfirm);

        let btnCancel = new TextButton(this,
            CAMERA_WIDTH/2 + 50, CAMERA_HEIGHT * 4 / 5, "취소", {
                onClick: () => {
                    if(this.isScrolling) return;
                    this.scene.stop(AttackTerritorySelectDialogScene.KEY);
                }
            }).setOrigin(0, 0.5);
        this.add.existing(btnCancel);
    }

    _isInList(x, y) {
        return x >= this.listX - this.listW/2
            && y >= this.listY
            && x <= this.listX + this.listW/2
            && y <= this.listY + this.listH;
    }
}
