class AttackTerritorySelectDialogScene extends Phaser.Scene {
    static get KEY() { return 'attackTerritorySelectDialog'; }

    constructor() {
        super({key: AttackTerritorySelectDialogScene.KEY});
        this.currentHover = null;
        this.listX = CAMERA_WIDTH/2;
        this.listY = CAMERA_HEIGHT/3 + 20;
        this.listW = 290;
        this.listH = 340;
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
        ignoreEvents(title);

        let fightableTerritories = this._getFightableTerritories();
        this._buildList(fightableTerritories);

        this._buildButtons();

        this.input
            .on('pointerdown', (p) => {
                if(!this.currentHover) return;
                console.log('DOWN on item');
            })
            .on('poointerup', (p) => {

            })
            .on('pointermove', (p) => {

            });
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
                })
                .on('pointerup', (p, x, y) => {
                })
                .on('pointerover', (p, x, y) => {
                    this.currentHover = item;
                })
                .on('pointerout', (p, x, y) => {
                    this.currentHover = null;
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

        // Covering list so that masked part doesn't get touched
        let c = this.add.image(0, 0, '');
        c.setAlpha(0, 0, 0, 0);
        c.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, 10, 10),
            (c, x, y) => {
                return this._isInList(x, y);
            }
        );
        ignoreEvents(c);

    }

    _buildButtons() {
        let btnConfirm = new TextButton(this,
            CAMERA_WIDTH/2 - 50, CAMERA_HEIGHT * 4 / 5, "확인", {
                onClick: () => {

                }
            }).setOrigin(1, 0.5);
        this.add.existing(btnConfirm);

        let btnCancel = new TextButton(this,
            CAMERA_WIDTH/2 + 50, CAMERA_HEIGHT * 4 / 5, "취소", {
                onClick: () => {
                    this.scene.stop(AttackTerritorySelectDialogScene.KEY);
                }
            }).setOrigin(0, 0.5);
        this.add.existing(btnCancel);
    }

    _isInList(x, y) {
        return x < this.listX - this.listW/2
            || y < this.listY
            || x > this.listX + this.listW/2
            || y > this.listY + this.listH;
    }
}
