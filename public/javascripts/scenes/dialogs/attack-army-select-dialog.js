class AttackArmySelectDialog extends Phaser.Scene {
    static get KEY() { return 'attackArmySelectDialogScene'; }

    constructor() {
        super({KEY: AttackArmySelectDialog.KEY});
    }

    init(data) {
        this.territory = data.territory;
        this.callback = data.callback;
    }

    preload() {
        this.load.image('background_dialog', 'assets/background_dialog.png');
        this.load.image('territory_icon', 'assets/world/tile_territory.png');
        this.load.image('quantity_icon', 'assets/ui/resources/icon_quantity.png');
        this.load.image('quality_icon', 'assets/ui/resources/icon_quality.png');
        this.load.image('coin', 'assets/ui/resources/icon_coin.png');
        this.load.image('food', 'assets/ui/resources/icon_food.png');
    }

    create() {
        let g = this.add.graphics();
        g.fillStyle(0x000000, 0.0);
        g.fillRect(0, IMAGE_HEIGHT, GAME_WIDTH, CAMERA_HEIGHT);
        ignoreEvents(g.setInteractive(new Phaser.Geom.Rectangle(), () => { return true; }));

        this.add.nineslice(
            200, 250, 400, 500, 'background_dialog', 30, 10
        );

        this.add.text(220, 270, '출진 병력 선택', { fontSize: 35 });

        this.add.existing(new TextButton(this, 420, 710, '확인', {
            fontSize: 20,
            onClick: () => {
                this.scene.remove(AttackArmySelectDialog.KEY);
                this.callback(this.card.value);
            }
        }));
        this.add.existing(new TextButton(this, 500, 710, '취소', {
            fontSize: 20,
            onClick: () => {
                this.scene.remove(AttackArmySelectDialog.KEY);
            }
        }));

        this.card = this.createCard();
        this.card.show(this.territory);
    }

    createCard() {
        let g = this.add.graphics();
        g.fillStyle(0x777777);
        g.fillRect(210, 310, 380, 390);

        let card = this.add.container(215, 310);

        let image = this.add.image(0, 0, 'territory_icon').setOrigin(0);
        card.add(image);
        image.setPosition(10, 0);

        let name = '영지(' + 0 + ', ' + 0 + ')';
        let title = this.add.text(0, 0, name, {fontSize: 20}).setOrigin(0, 0.5);
        card.add(title);
        title.setPosition(130, 50);

        let quantityIcon = this.add.image(0, 0, 'quantity_icon').setOrigin(0, 0.5);
        card.add(quantityIcon);
        quantityIcon.setPosition(10, 125);

        let qualityIcon = this.add.image(0, 0, 'quality_icon').setOrigin(0, 0.5);
        card.add(qualityIcon);
        qualityIcon.setPosition(190, 125);

        let quantityText = this.add.text(0, 0, "100").setOrigin(0, 0.5);
        card.add(quantityText);
        quantityText.setPosition(50, 125);

        let qualityText = this.add.text(0, 0, "70").setOrigin(0, 0.5);
        card.add(qualityText);
        qualityText.setPosition(230, 125);



        let countText = this.add.text(0, 0, "출진할 병사: 100명").setOrigin(0.5);
        card.add(countText);
        countText.setPosition(190, 165);

        let slider = new HorizontalSlider(this, 190, 210, 330, {
            min: 1,
            max: this.territory.quantity,
            isDiscrete: true
        });
        this.add.existing(slider);
        card.add(slider);

        let consumeTitle = this.add.text(10, 260, "소모 자원").setOrigin(0);
        card.add(consumeTitle);

        let moneyIcon = this.add.image(10, 305, 'coin').setOrigin(0, 0.5);
        card.add(moneyIcon);

        let foodIcon = this.add.image(190, 305, 'food').setOrigin(0, 0.5);
        card.add(foodIcon);

        let moneyText = this.add.text(50, 305, "1000").setOrigin(0, 0.5);
        card.add(moneyText);

        let foodText = this.add.text(240, 305, "1000").setOrigin(0, 0.5);
        card.add(foodText);



        let onValueChange = (v) => {
            countText.setText("출진할 병사: " + v + "명");
            card.calculateResources(v);
            card.value = v;
        };
        slider.setOnValueChangeListener(onValueChange);


        card.title = title;
        card.quantityText = quantityText;
        card.qualityText = qualityText;
        card.countText = countText;
        card.moneyText = moneyText;
        card.foodText = foodText;
        card.slider = slider;

        card.calculateResources = function(usingQuantity) {
            let consume = Engine.calculateCost(usingQuantity, card.territory.army.quality, 10);
            let foodConsume = consume.foodConsume;
            let moneyConsume = consume.moneyConsume;

            foodText.setText(foodConsume);
            moneyText.setText(moneyConsume);

            card.foodConsume = foodConsume;
            card.moneyConsume = moneyConsume;
        };

        card.show = function(territory) {
            card.territory = territory;
            // set value of widgets to selected territory
            card.title.setText("영지" + "(" + territory.x + ", " + territory.y + ")");
            card.quantityText.setText(territory.army.quantity);
            card.qualityText.setText(territory.army.quality);

            slider.max = territory.army.quantity;
            onValueChange(territory.army.quantity);

            card.setVisible(true);
        };

        return card;
    }
}