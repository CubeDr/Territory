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

        this.add.text(textX - 50, CAMERA_HEIGHT * 4 / 5, "확인").setOrigin(1, 0.5);
        this.add.text(textX + 50, CAMERA_HEIGHT * 4 / 5, "취소").setOrigin(0, 0.5);
    }

    _getFightableTerritories() {
        let ts = [];
        this.player.territories.forEach((t) => {
            if(t.army.quantity !== 0) ts.push(t);
        });
        return ts;
    }

    _buildList(territoryList) {
        let list = this.add.container(CAMERA_WIDTH/2, CAMERA_HEIGHT/3);

        territoryList.forEach((t) => {
            var item = this.add.container(0, 0);

            var background = this.add.image(0, 0, 'item_back');
            item.add(background);

            list.add(item);
        });
    }
}
