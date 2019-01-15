class TerritoryEnterDialog extends Phaser.GameObjects.Container {
    constructor(scene, config) {
        super(scene, config);
        this.scene = scene;
        this.width = 200;
        this.height = 80;

        this.territory = null;

        let background = scene.add.image(0, 0, 'rectangle');
        background.setInteractive().on('pointerdown', (p, x, y, e) => {
            e.stopPropagation();
        });
        this.add(background);

        let quantityIcon = scene.add.image(0, 0, 'quantity');
        this.add(quantityIcon);
        quantityIcon.setPosition(-70, -10);

        let quantityText = scene.add.text(0, 0, '0', {fontSize: 20});
        this.add(quantityText);
        quantityText.setOrigin(0, 0.5);
        quantityText.setPosition(-50, -10);
        this.quantityText = quantityText;

        let qualityIcon = scene.add.image(0, 0, 'quality');
        this.add(qualityIcon);
        qualityIcon.setPosition(15, -10);

        let qualityText = scene.add.text(0, 0, '0', {fontSize: 20});
        this.add(qualityText);
        qualityText.setOrigin(0, 0.5);
        qualityText.setPosition(35, -10);
        this.qualityText = qualityText;

        let enterButton = new TextButton(scene, 0, 0, '입장', {
            onClick: () => scene.scene.start('territory', this.territory)
        });
        this.add(enterButton);
        enterButton.setOrigin(0.5);
        enterButton.setPosition(0, 25);
        this.setVisible(false);
    }

    update() {
        if(!this.territory) return;
        this.quantityText.setText(this.territory.army.quantity);
        this.qualityText.setText(this.territory.army.quality);
    }

}