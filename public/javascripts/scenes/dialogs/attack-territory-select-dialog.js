class AttackTerritorySelectDialog extends Phaser.Scene {
    static get KEY() { return 'attackTerritorySelectDialog'; }

    constructor() {
        super({KEY: AttackTerritorySelectDialog.KEY});
        this.pointer = {};
    }

    init(callback) {
        this.callback = callback;
    }

    preload() {
        this.load.image('background_dialog', 'assets/background_dialog.png');
        this.load.image('item_back', 'assets/ui/list_item.png');
        this.load.image('item_back_selected', 'assets/ui/list_item_selected.png');
        this.load.image('icon', 'assets/ui/territory_icon.png');
        this.load.image('quantity_icon', 'assets/ui/resources/icon_quantity.png');
        this.load.image('quality_icon', 'assets/ui/resources/icon_quality.png');
    }

    create () {
        let g = this.add.graphics();
        g.fillStyle(0x000000, 0.0);
        g.fillRect(0, IMAGE_HEIGHT, GAME_WIDTH, CAMERA_HEIGHT);
        ignoreEvents(g.setInteractive(new Phaser.Geom.Rectangle(), () => { return true; }));

        this.add.nineslice(
            200, 250, 400, 500, 'background_dialog', 30, 10
        );

        this.add.text(220, 270, '출진 영지 선택', { fontSize: 35 });

        this.add.existing(new TextButton(this, 420, 710, '확인', {
            fontSize: 20,
            onClick: () => {
                if(this.selected == null) return;
                this.scene.add(AttackArmySelectDialog.KEY, AttackArmySelectDialog);
                this.scene.launch(AttackArmySelectDialog.KEY, this.selected.territory);
            }
        }));
        this.add.existing(new TextButton(this, 500, 710, '취소', {
            fontSize: 20,
            onClick: () => {
                this.close();
            }
        }));

        this.list = this.createTerritoryList();
    }

    close() {
        this.list.iterate((item) => {
            gameEngine
                .off('changeQuantity', item.quantityListener)
                .off('changeQuality', item.qualityListener);
        });
        this.scene.remove(AttackTerritorySelectDialog.KEY);
    }

    createTerritoryList() {
        let g = this.add.graphics();
        g.fillStyle(0x777777);
        g.fillRect(210, 310, 380, 390);

        let list = this.add.container(215, 310);
        list.mask = g.createGeometryMask();

        let y = 5;
        gameEngine.player.territories.forEach((t) => {
            let item = this.createTerritoryItem(t);
            item.setPosition(item.x, y);
            list.add(item);
            y += 80;
        });

        g.setInteractive(new Phaser.Geom.Rectangle(210, 310, 380, 390), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', this.pointerDown, this)
            .on('pointerup', this.pointerUp, this)
            .on('pointermove', this.pointerMove, this);

        return list;
    }

    createTerritoryItem(t) {
        let item = this.add.container();
        item.territory = t;

        item.back = this.add.nineslice(0, 0, 370, 75, 'item_back', 30, 10).setOrigin(0);
        item.add(item.back);

        item.backSel = this.add.nineslice(0, 0, 370, 75, 'item_selected', 30, 10).setOrigin(0);
        item.add(item.backSel);
        item.backSel.visible = false;

        let icon = this.add.image(8, 8, 'icon').setOrigin(0);
        item.add(icon);

        let text = this.add.text(74, 20, '영지(' + t.x + ", " + t.y + ")")
            .setOrigin(0, 0.5);
        item.add(text);

        let quantityIcon = this.add.image(74, 36, 'quantity_icon').setOrigin(0);
        item.add(quantityIcon);

        let quantityText = this.add.text(109, 51, Math.floor(t.army.quantity), {fontSize:20}).setOrigin(0, 0.5);
        item.add(quantityText);

        let qualityIcon = this.add.image(177, 36, 'quality_icon').setOrigin(0);
        item.add(qualityIcon);

        let qualityText = this.add.text(212, 51, Math.floor(t.army.quality), {fontSize:20}).setOrigin(0, 0.5);
        item.add(qualityText);

        item.quantityListener = (t) => {
            if(t !== item.territory) return;
            quantityText.setText(Math.floor(t.army.quantity));
        };
        item.qualityListener = (t) => {
            if(t !== item.territory) return;
            qualityText.setText(Math.floor(t.army.quality));
        };
        this.scene.get('engine')
            .on('changeQuantity', item.quantityListener)
            .on('changeQuality', item.qualityListener);

        item.setInteractive(new Phaser.Geom.Rectangle(0, 0, 370, 75), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', (p) => {
                this.pointerDown(p);
            }, this)
            .on('pointerup', (p) => {
                if(!this.isScrolling) {
                    if(!this._isInBody(p.x, p.y) || this.pointer.down==null) return;
                    if(this.selected === item) {
                        // unselect
                        this.selected = null;
                        item.back.visible = true;
                        item.backSel.visible = false;
                    } else if(this.selected != null) {
                        // unselect
                        this.selected.back.visible = true;
                        this.selected.backSel.visible = false;
                        // select
                        this.selected = item;
                        this.selected.back.visible = false;
                        this.selected.backSel.visible = true;
                    } else {
                        // select
                        this.selected = item;
                        item.back.visible = false;
                        item.backSel.visible = true;
                    }
                }
                this.pointerUp(p);
            }, this)
            .on('pointermove', this.pointerMove, this);

        return item;
    }

    _isInBody(x, y) {
        return !(x < 210 || x > 590 || y < 310 || y > 700);
    }

    pointerDown(p) {
        if(!this._isInBody(p.x, p.y)) return;
        this.pointer.down = {
            x: p.x, y: p.y
        };
        this.pointer.last = {
            x: p.x, y: p.y
        };
    }

    pointerUp(p) {
        this.pointer.down = null;
        this.isScrolling = false;
    }

    pointerMove(p) {
        if(this.pointer.down == null) return;

        let delta = p.y - this.pointer.last.y;
        this.pointer.last = {
            x: p.x, y: p.y
        };
        if(!this.isScrolling) {
            if(sqDistance(this.pointer.down, this.pointer.last) >= 25) {
                this.isScrolling = true;
                delta = this.pointer.last.y - this.pointer.down.y;
            }
        }

        if(this.isScrolling) {
            this.list.setPosition(this.list.x, this.list.y + delta);
        }
    }

}