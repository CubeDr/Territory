class AttackArmyListDialogScene extends Phaser.Scene {
    static get KEY() { return 'attackArmyListDialogScene'; }

    constructor() {
        super({KEY: AttackArmyListDialogScene.KEY});
        this.pointer = {};
        this.index = 0;
    }

    preload() {
        this.load.image('background_dialog', 'assets/background_dialog.png');
        this.load.image('item_back', 'assets/ui/list_item.png');
        this.load.image('territory_image', 'assets/world/tile_territory.png');
        this.load.image('quantity_icon', 'assets/ui/resources/icon_quantity.png');
        this.load.image('quality_icon', 'assets/ui/resources/icon_quality.png');
        this.load.image('money_icon', 'assets/ui/resources/icon_coin.png');
        this.load.image('food_icon', 'assets/ui/resources/icon_food.png');
    }

    create () {
        let g = this.add.graphics();
        g.fillStyle(0x000000, 0.0);
        g.fillRect(0, IMAGE_HEIGHT, GAME_WIDTH, CAMERA_HEIGHT);
        ignoreEvents(g.setInteractive(new Phaser.Geom.Rectangle(), () => { return true; }));

        this.add.nineslice(
            200, 250, 400, 500, 'background_dialog', 30, 10
        );

        this.add.text(220, 270, '출진 병력 리스트', { fontSize: 35 });

        this.add.text(220, 620, '소모 자원', {fontSize: 20});
        this.add.image(260, 670, 'money_icon');
        this.add.image(420, 670, 'food_icon');

        this.moneyText = this.add.text(290, 660, '0', {fontSize: 18});
        this.foodText = this.add.text(450, 660, '0', {fontSize: 18});

        this.add.existing(new TextButton(this, 250, 710, '추가', {
            fontSize: 20,
            onClick: () => {
                this.scene.add(AttackTerritorySelectDialog.KEY, AttackTerritorySelectDialog);
                this.scene.launch(AttackTerritorySelectDialog.KEY, (count, territory) => {
                    console.log(count, territory);
                    // territory에서 count명을 출진
                    let item = this.createArmyItem(count, territory);
                    this.addItemToList(item);
                });
            }
        }));
        this.add.existing(new TextButton(this, 420, 710, '확인', {
            fontSize: 20,
            onClick: () => {
                this.scene.remove(AttackArmyListDialogScene.KEY);
            }
        }));
        this.add.existing(new TextButton(this, 500, 710, '취소', {
            fontSize: 20,
            onClick: () => {
                this.scene.remove(AttackArmyListDialogScene.KEY);
            }
        }));

        this.list = this.createArmyList();
        this.updateResourceConsume();
    }

    createArmyList() {
        let g = this.add.graphics();
        g.fillStyle(0x777777);
        g.fillRect(210, 310, 380, 300);

        let list = this.add.container(215, 310);
        list.mask = g.createGeometryMask();

        g.setInteractive(new Phaser.Geom.Rectangle(210, 310, 380, 300), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', this.pointerDown, this)
            .on('pointerup', this.pointerUp, this)
            .on('pointermove', this.pointerMove, this);

        return list;
    }

    createArmyItem(count, territory) {
        let item = this.add.container();
        item.index = ++this.index;
        item.count = count;
        item.territory = territory;

        let consume = Engine.calculateCost(count, territory.army.quality, 10);

        let back = this.add.nineslice(0, 0, 370, 75, 'item_back', 30, 10).setOrigin(0);
        item.add(back);

        item.indexText = this.add.text(15, 20, item.index + ".", {fontSize: 25});
        item.add(item.indexText);

        let territoryText = this.add.text(70, 15, '영지(' + territory.x + ', ' + territory.y + ')');
        item.add(territoryText);

        let quantityIcon = this.add.image(200, 25, 'quantity_icon').setScale(0.8);
        item.add(quantityIcon);

        let quantityText = this.add.text(230, 18, count.toString());
        item.add(quantityText);

        let qualityIcon = this.add.image(285, 25, 'quality_icon').setScale(0.8);
        item.add(qualityIcon);

        let qualityText = this.add.text(315, 18, territory.army.quality.toString());
        item.add(qualityText);

        let consumeText = this.add.text(80, 45, '소모자원', {fontSize: 13});
        item.add(consumeText);

        let moneyIcon = this.add.image(160, 50, 'money_icon').setScale(0.5);
        item.add(moneyIcon);

        let moneyText = this.add.text(175, 42, consume.moneyConsume.toString());
        item.add(moneyText);

        let foodIcon = this.add.image(250, 50, 'food_icon').setScale(0.5);
        item.add(foodIcon);

        let foodText = this.add.text(265, 42, consume.foodConsume.toString());
        item.add(foodText);

        return item;
    }

    addItemToList(item) {
        this.list.add(item);
        item.setPosition(item.x, 5 + (item.index-1) * 80);
        this.updateResourceConsume();
    }

    _isInBody(x, y) {
        return !(x < 210 || x > 590 || y < 310 || y > 610);
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

    updateResourceConsume() {
        let total = {
            money: 0,
            food: 0
        };

        this.list.iterate((child) => {
            let count = child.count;
            let quality = child.territory._army.quality;
            let consume = Engine.calculateCost(count, quality, 10);
            total.money += consume.moneyConsume;
            total.food += consume.foodConsume;
        });

        this.moneyText.setText(total.money.toString());
        this.foodText.setText(total.food.toString());

        this.moneyText.setColor(gameEngine.player.money>=total.money?'#ffffff':'#ff0000');
        this.foodText.setColor(gameEngine.player.food>=total.food?'#ffffff':'#ff0000');
    }
}