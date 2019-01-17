class AttackTerritorySelectDialogScene extends Phaser.Scene {
    static get KEY() { return 'attackTerritorySelectDialog'; }

    constructor() {
        super({key: AttackTerritorySelectDialogScene.KEY});
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
        this.add.text(textX, textY, "병력을 출진시킬 영지를 선택하세요").setOrigin(0.5, 1)
        // set dialog modal
            .setInteractive(new Phaser.Geom.Rectangle(), () => { return true; })
            .on('pointerdown',  (p, x, y, e) => e.stopPropagation())
            .on('pointerup',    (p, x, y, e) => e.stopPropagation())
            .on('pointermove',  (p, x, y, e) => e.stopPropagation())
            .on('pointerover',  (p, x, y, e) => e.stopPropagation())
            .on('pointerout',   (p, e) => e.stopPropagation());

        let fightableTerritories = this._getFightableTerritories();
        this._buildList(fightableTerritories);

        let btnConfirm = new TextButton(this,
            textX - 50, CAMERA_HEIGHT * 4 / 5, "확인", {
            onClick: () => {

            }
        }).setOrigin(1, 0.5);
        this.add.existing(btnConfirm);

        let btnCancel = new TextButton(this,
            textX + 50, CAMERA_HEIGHT * 4 / 5, "취소", {
            onClick: () => {
                this.scene.stop(AttackTerritorySelectDialogScene.KEY);
            }
        }).setOrigin(0, 0.5);
        this.add.existing(btnCancel);
    }

    _getFightableTerritories() {
        let ts = [];
        this.player.territories.forEach((t) => {
            if(t.army.quantity !== 0) ts.push(t);
        });
        return ts;
    }

    _buildList(territoryList) {
        let list = this.add.container(CAMERA_WIDTH/2, CAMERA_HEIGHT/3 + 50);

        let originX = -145;
        let originY = -37;

        let offsetY = 0;
        territoryList.forEach((t) => {
            var item = this.add.container(0, 0);

            var background = this.add.image(0, 0, 'item_back');
            item.add(background);

            var icon = this.add.image(0, 0, 'icon').setOrigin(0);
            item.add(icon);
            icon.setPosition(originX + 8, originY + 8);

            var text = this.add.text(0, 0, '영지(' + t.x + ", " + t.y + ")")
                .setOrigin(0, 0.5);
            item.add(text);
            text.setPosition(originX + 74, originY + 20);

            var quantityIcon = this.add.image(0, 0, 'quantity_icon').setOrigin(0);
            item.add(quantityIcon);
            quantityIcon.setPosition(originX + 74, originY + 36);

            var quantityText = this.add.text(0, 0, t.army.quantity, {fontSize:20}).setOrigin(0, 0.5);
            item.add(quantityText);
            quantityText.setPosition(originX + 109, originY + 51);

            var qualityIcon = this.add.image(0, 0, 'quality_icon').setOrigin(0);
            item.add(qualityIcon);
            qualityIcon.setPosition(originX + 177, originY + 36);

            var qualityText = this.add.text(0, 0, t.army.quality, {fontSize:20}).setOrigin(0, 0.5);
            item.add(qualityText);
            qualityText.setPosition(originX + 212, originY + 51);

            list.add(item);
            item.setPosition(0, offsetY);
            offsetY += 85;
        });
    }
}
