class AttackTerritorySelectDialogScene extends Phaser.Scene {
    static get KEY() { return 'attackTerritorySelectDialog'; }

    constructor() {
        super({key: AttackTerritorySelectDialogScene.KEY});
        this.currentHover = null;
        this.list = null;
        this.card = null;
        this.bodyX = CAMERA_WIDTH/2;
        this.bodyY = CAMERA_HEIGHT/3 + 20;
        this.bodyWidth = 290;
        this.bodyHeight = 340;
        this.isScrolling = false;
        this.lastPointerPosition = null;
        this.selected = null;
        this.state = 'territory';
    }

    init(config) {
        this.player = config.player;
        // target bandit to attack
        this.target = config.target;
    }

    preload() {
        this.load.image('item_back', 'assets/ui/list_item_back.png');
        this.load.image('item_back_selected', 'assets/ui/list_item_back_selected.png');
        this.load.image('icon', 'assets/ui/territory_icon.png');
        this.load.image('territory_image', 'assets/world/territory.png');
        this.load.image('quantity_icon', 'assets/ui/resources/quantity.png');
        this.load.image('quality_icon', 'assets/ui/resources/quality.png');
        this.load.image('money_icon', 'assets/ui/resources/coin.png');
        this.load.image('food_icon', 'assets/ui/resources/food.png');
    }

    create() {
        let g = this.add.graphics();
        g.fillStyle(0x000000, 0.7);
        g.fillRect(0, IMAGE_HEIGHT, GAME_WIDTH, CAMERA_HEIGHT);

        g.fillStyle(0xaaaaaa, 1);
        g.fillRoundedRect(this.bodyX - this.bodyWidth/2 - 10, this.bodyY - 10, this.bodyWidth + 20, this.bodyHeight + 20, 5);

        let textX = CAMERA_WIDTH / 2;
        let textY = CAMERA_HEIGHT / 3;
        // title text
        this.title = this.add.text(textX, textY, "병력을 출진시킬 영지를 선택하세요").setOrigin(0.5, 1);
        // set dialog modal
        this.title.setInteractive(new Phaser.Geom.Rectangle(), () => { return true; });

        let fightableTerritories = this._getFightableTerritories();
        this.list = this._buildList(fightableTerritories);
        this.card = this._buildCard();
        this.card.setVisible(false);

        this._buildButtons();

        this.input
            .on('pointerdown', (p) => {
                if(this.state !== 'territory') return;
                if(!this._isInBody(p.x, p.y)) return;
                this.lastPointerPosition = {
                    x: p.x,
                    y: p.y
                };
            }, this)
            .on('pointerup', (p) => {
                if(this.state !== 'territory') return;
                if(!this.lastPointerPosition) return;
                this.lastPointerPosition = null;
                if(!this._isInBody(p.x, p.y) && this.currentHover)
                    this.currentHover.iterate((c) => {
                        c.clearTint();
                    });
                if(this.isScrolling) {
                    // stop scrolling
                    this.isScrolling = false;
                }
            }, this)
            .on('pointermove', (p) => {
                if(this.state !== 'territory') return;
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
                    this._scroll(deltaY);
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
        let list = this.add.container(this.bodyX, this.bodyY);

        // Adding territories to the list
        let originX = -this.bodyWidth/2;

        let offsetY = 0;
        territoryList.forEach((t) => {
            var item = this.add.container(0, 0);
            item.territory = t;

            var background = this.add.image(0, 0, 'item_back').setOrigin(0.5, 0);
            item.add(background);
            item.background = background;

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

            item.quantityListener = (t) => {
                if(t !== item.territory) return;
                quantityText.setText(t.army.quantity);
            };
            item.qualityListener = (t) => {
                if(t !== item.territory) return;
                qualityText.setText(t.army.quality);
            };

            this.scene.get('engine')
                .on('changeQuantity', item.quantityListener)
                .on('changeQuality', item.qualityListener);

            item.setInteractive(
                new Phaser.Geom.Rectangle(originX, 0, 290, 74),
                Phaser.Geom.Rectangle.Contains
            )
                .on('pointerdown', (p, x, y) => {
                    if(!this._isInBody(p.x, p.y)) return;
                    item.iterate((c) => {
                        c.setTint(0x999999);
                    });
                })
                .on('pointerup', (p, x, y) => {
                    if(!this._isInBody(p.x, p.y)) return;
                    item.iterate((c) => {
                        c.setTint(0xaaaaaa);
                    });
                    if(!this.isScrolling) {
                        // click
                        this._select(item);
                    }
                })
                .on('pointerover', (p, x, y) => {
                    if(!this._isInBody(p.x, p.y)) return;
                    this.currentHover = item;
                    item.iterate((c) => {
                        c.setTint(0xaaaaaa);
                    });
                })
                .on('pointerout', (p, x, y) => {
                    if(!this._isInBody(p.x, p.y)) return;
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
        g.fillRect(this.bodyX - this.bodyWidth/2, this.bodyY, this.bodyWidth, this.bodyHeight);
        list.mask = g.createGeometryMask();

        return list;
    }

    _buildCard() {
        let card = this.add.container(this.bodyX, this.bodyY);

        let image = this.add.image(0, 0, 'territory_image').setOrigin(0);
        card.add(image);
        image.setPosition(-this.bodyWidth/2, 0);

        let name = '영지(' + 0 + ', ' + 0 + ')';
        let title = this.add.text(0, 0, name, {fontSize: 20}).setOrigin(0, 0.5);
        card.add(title);
        title.setPosition(-10, 50);

        let quantityIcon = this.add.image(0, 0, 'quantity_icon').setOrigin(0, 0.5);
        card.add(quantityIcon);
        quantityIcon.setPosition(-this.bodyWidth/2, 125);

        let qualityIcon = this.add.image(0, 0, 'quality_icon').setOrigin(0, 0.5);
        card.add(qualityIcon);
        qualityIcon.setPosition(0, 125);

        let quantityText = this.add.text(0, 0, "100").setOrigin(0, 0.5);
        card.add(quantityText);
        quantityText.setPosition(-this.bodyWidth/2 + 40, 125);

        let qualityText = this.add.text(0, 0, "70").setOrigin(0, 0.5);
        card.add(qualityText);
        qualityText.setPosition(40, 125);



        let countText = this.add.text(0, 0, "출진할 병사: 100명").setOrigin(0.5);
        card.add(countText);
        countText.setPosition(0, 165);

        let slider = new HorizontalSlider(this, 0, 0, this.bodyWidth, {
            min: 1,
            isDiscrete: true
        });
        this.add.existing(slider);
        card.add(slider);
        slider.setPosition(0, 210);



        let consumeTitle = this.add.text(0, 0, "소모 자원").setOrigin(0);
        card.add(consumeTitle);
        consumeTitle.setPosition(-this.bodyWidth/2, 260);

        let moneyIcon = this.add.image(0, 0, 'money_icon').setOrigin(0, 0.5);
        card.add(moneyIcon);
        moneyIcon.setPosition(-this.bodyWidth/2, 305);

        let foodIcon = this.add.image(0, 0, 'food_icon').setOrigin(0, 0.5);
        card.add(foodIcon);
        foodIcon.setPosition(0, 305);

        let moneyText = this.add.text(0, 0, "1000").setOrigin(0, 0.5);
        card.add(moneyText);
        moneyText.setPosition(-this.bodyWidth/2 + 40, 305);

        let foodText = this.add.text(0, 0, "1000").setOrigin(0, 0.5);
        card.add(foodText);
        foodText.setPosition(40, 305);



        let onValueChange = (v) => {
            countText.setText("출진할 병사: " + v + "명");
            card.calculateResources(v);
        };
        slider.setOnValueChangeListener(onValueChange);


        card.title = title;
        card.quantityText = quantityText;
        card.qualityText = qualityText;
        card.countText = countText;
        card.moneyText = moneyText;
        card.foodText = foodText;
        card.slider = slider;


        let player = this.player;

        card.checkResourcesEnough = function() {
            if(card.foodConsume > player.food) foodText.setColor("#ff0000");
            else foodText.setColor("#ffffff");
            if(card.moneyConsume > player.money) moneyText.setColor("#ff0000");
            else moneyText.setColor("#ffffff");
        };

        let target = this.target;
        card.calculateResources = function(usingQuantity) {
            let armyFactor = usingQuantity * card.territory.army.quality / 100;

            let d = Math.sqrt(sqDistance(card.territory, target));

            let foodConsume = Math.ceil(d * armyFactor * FIGHT_ARMY_FOOD);
            let moneyConsume = Math.ceil(d * armyFactor * FIGHT_ARMY_MONEY);

            foodText.setText(foodConsume);
            moneyText.setText(moneyConsume);

            card.foodConsume = foodConsume;
            card.moneyConsume = moneyConsume;

            card.checkResourcesEnough();
        };

        let engine = this.scene.get('engine');
        card.show = function(territory) {
            card.territory = territory;
            // set value of widgets to selected territory
            card.title.setText("영지" + "(" + territory.x + ", " + territory.y + ")");
            card.quantityText.setText(territory.army.quantity);
            card.qualityText.setText(territory.army.quality);

            slider.max = territory.army.quantity;
            onValueChange(territory.army.quantity);

            engine.on('changeMoney', card.checkResourcesEnough)
                  .on('changeFood', card.checkResourcesEnough);

            card.setVisible(true);
        };

        card.hide = function() {
            engine.off('changeMoney', card.checkResourcesEnough)
                  .off('changeFood', card.checkResourcesEnough);

            card.setVisible(false);
        };

        return card;
    }

    _buildButtons() {
        let btnConfirm = new TextButton(this,
            CAMERA_WIDTH/2 - 50, CAMERA_HEIGHT * 4 / 5 + 10, "확인", {
                onClick: () => {
                    if(this.state === 'territory') {
                        if(this.isScrolling) return;
                        if(!this.selected) return;
                        this._setState('quantity');
                    } else {
                        // select done
                    }
                }
            }).setOrigin(1, 0.5);
        this.add.existing(btnConfirm);

        let btnCancel = new TextButton(this,
            CAMERA_WIDTH/2 + 50, CAMERA_HEIGHT * 4 / 5 + 10, "취소", {
                onClick: () => {
                    if(this.state === 'territory') {
                        if(this.isScrolling) return;
                        this._offAllListeners();
                        this.scene.remove(AttackTerritorySelectDialogScene.KEY);
                    } else {
                        this._setState('territory');
                    }
                }
            }).setOrigin(0, 0.5);
        this.add.existing(btnCancel);
    }

    _isInBody(x, y) {
        return x >= this.bodyX - this.bodyWidth/2
            && y >= this.bodyY
            && x <= this.bodyX + this.bodyWidth/2
            && y <= this.bodyY + this.bodyHeight;
    }

    _offAllListeners() {
        this.list.iterate((item) => {
            this.scene.get('engine')
                .off('changeQuantity', item.quantityListener)
                .off('changeQuality', item.qualityListener);
        });
    }

    _scroll(deltaY) {
        this.list.iterate((item) => {
            item.setPosition(item.x, item.y - deltaY);
        });
    }

    _select(item) {
        if(this.selected) this.selected.background.setTexture('item_back');
        this.selected = item;
        item.background.setTexture('item_back_selected');
    }

    _setState(state) {
        this.state = state;
        if(state === 'territory') {
            this.list.setVisible(true);
            this.card.hide();
            this.title.setText('병력을 출진시킬 영지를 선택하세요');
        } else if(state === 'quantity') {
            this.title.setText('출진시킬 병력의 양을 결정하세요');
            this.list.setVisible(false);
            this.card.show(this.selected.territory);
        }
    }
}
