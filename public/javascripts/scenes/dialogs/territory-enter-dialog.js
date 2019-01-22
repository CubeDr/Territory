class TerritoryEnterDialog extends Phaser.GameObjects.Container {
    constructor(scene, config) {
        super(scene, config);
        this.scene = scene;
        this.width = 200;
        this.height = 120;

        this.territory = null;

        let background = scene.add.nineslice(
            0, 0, this.width, this.height, 'rectangle', 30, 10
        ).setOrigin(0.5);
        background.setInteractive().on('pointerdown', (p, x, y, e) => {
            e.stopPropagation();
        });
        this.add(background);

        let title = scene.add.text(0, 0, '영지(0, 0)', {fontSize: 20}).setOrigin(0.5, 0.5);
        this.add(title);
        title.setPosition(0, -35);
        this.titleText = title;

        let quantityIcon = scene.add.image(0, 0, 'quantity');
        this.add(quantityIcon);
        quantityIcon.setPosition(-70, 0);

        let quantityText = scene.add.text(0, 0, '0', {fontSize: 20});
        this.add(quantityText);
        quantityText.setOrigin(0, 0.5);
        quantityText.setPosition(-50, 0);
        this.quantityText = quantityText;

        let qualityIcon = scene.add.image(0, 0, 'quality');
        this.add(qualityIcon);
        qualityIcon.setPosition(15, 0);

        let qualityText = scene.add.text(0, 0, '0', {fontSize: 20});
        this.add(qualityText);
        qualityText.setOrigin(0, 0.5);
        qualityText.setPosition(35, 0);
        this.qualityText = qualityText;

        let enterButton = new TextButton(scene, 0, 0, '입장', {
            onClick: () => {
                scene.scene.stop('worldUi');
                scene.scene.start('territory', this.territory)
            }
        });
        this.add(enterButton);
        enterButton.setOrigin(0.5);
        enterButton.setPosition(0, 40);
        this.setVisible(false);
    }

    update() {
        if(!this.territory) return;
        this.titleText.setText("영지(" + this.territory.x + ", " + this.territory.y + ")");
        this.quantityText.setText(parseInt(this.territory.army.quantity));
        this.qualityText.setText(parseInt(this.territory.army.quality));
    }

}