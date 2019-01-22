class BanditAttackDialog extends Phaser.GameObjects.Container {
    constructor(scene, player, config) {
        super(scene, config);
        this.scene = scene;
        this.width = 200;
        this.height = 200;

        this.territory = null;

        let background = scene.add.nineslice(
            0, 0, this.width, this.height, 'rectangle', 30, 10
        ).setOrigin(0.5);
        background.setInteractive().on('pointerdown', (p, x, y, e) => {
            e.stopPropagation();
        });
        this.add(background);

        let title = scene.add.text(0, 0, "산적", { fontSize: 25 }).setOrigin(0.5);
        this.add(title);
        title.setPosition(0, -this.height/2 + 25);


        let scale = scene.add.text(0, 0, "규모").setOrigin(0, 0.5);
        this.add(scale);

        let quantityIcon = scene.add.image(0, 0, 'quantity').setScale(0.8);
        this.add(quantityIcon);

        let quantityText = scene.add.text(0, 0, '0', {fontSize: 20}).setOrigin(0, 0.5);
        this.add(quantityText);
        this.quantityText = quantityText;

        let qualityIcon = scene.add.image(0, 0, 'quality').setScale(0.8);
        this.add(qualityIcon);

        let qualityText = scene.add.text(0, 0, '0', {fontSize: 20}).setOrigin(0, 0.5);
        this.add(qualityText);
        this.qualityText = qualityText;

        this._placeInfoCard(-this.height/2 + 55, scale, quantityIcon, quantityText, qualityIcon, qualityText);


        let reward = scene.add.text(0, 0, "보상").setOrigin(0, 0.5);
        this.add(reward);

        let moneyIcon = scene.add.image(0, 0, 'coin').setScale(0.8);
        this.add(moneyIcon);

        let moneyText = scene.add.text(0, 0, '0', {fontSize: 20}).setOrigin(0, 0.5);
        this.add(moneyText);

        let foodIcon = scene.add.image(0, 0, 'food').setScale(0.8);
        this.add(foodIcon);

        let foodText=  scene.add.text(0, 0, '0', {fontSize: 20}).setOrigin(0, 0.5);
        this.add(foodText);

        this._placeInfoCard(15, reward, moneyIcon, moneyText, foodIcon, foodText);

        let attackButton = new TextButton(scene, 0, 0, '공격', {
            onClick: () => {
                scene.scene.add(AttackTerritorySelectDialogScene.KEY,
                    AttackTerritorySelectDialogScene);
                scene.scene.launch(AttackTerritorySelectDialogScene.KEY, {
                    player: player,
                    target: this.bandit
                });
                this.setVisible(false);
            }
        }).setOrigin(0.5);
        this.add(attackButton);
        attackButton.setPosition(0, this.width/2 - 20);
        this.setVisible(false);
    }

    setBandit(banditConfig) {
        this.bandit = banditConfig;
        this.quantityText.setText(banditConfig.quantity);
        this.qualityText.setText(banditConfig.quality);
    }

    _placeInfoCard(offsetY, title, lIcon, lText, rIcon, rText) {
        let offsetX = -this.width/2 + 10;
        title.setPosition(offsetX, offsetY);
        lIcon.setPosition(offsetX + 20, offsetY + 25);
        lText.setPosition(offsetX + 40, offsetY + 25);
        rIcon.setPosition(offsetX + 105, offsetY + 25);
        rText.setPosition(offsetX + 125, offsetY + 25);
    }
}