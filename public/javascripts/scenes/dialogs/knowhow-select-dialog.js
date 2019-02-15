class KnowhowSelectDialogScene extends Phaser.Scene {
    static get KEY() { return 'knowhowSelectDialog'; }

    constructor() {
        super({KEY: KnowhowSelectDialogScene.KEY});
    }

    init(callback) {
        this.callback = callback;
    }

    preload() {
        this.load.image('background_dialog', 'assets/background_dialog.png');
        this.load.image('item_back', 'assets/ui/list_item.png');
        this.load.image('item_selected', 'assets/ui/list_item_selected.png');
    }

    create() {
        let g = this.add.graphics();
        g.fillStyle(0x000000, 0.7);
        g.fillRect(0, IMAGE_HEIGHT, GAME_WIDTH, CAMERA_HEIGHT);
        ignoreEvents(g.setInteractive(new Phaser.Geom.Rectangle(), () => { return true; }));

        this.add.nineslice(
            200, 250, 400, 500, 'background_dialog', 30, 10
        );

        this.add.text(220, 270, '건축 노하우 선택', { fontSize: 35 });

        this.add.existing(new TextButton(this, 420, 710, '확인', {
            fontSize: 20,
            onClick: () => {
                this.callback(1);
                this.scene.remove(KnowhowSelectDialogScene.KEY);
            }
        }));
        this.add.existing(new TextButton(this, 500, 710, '취소', {
            fontSize: 20,
            onClick: () => {
                this.callback(null);
                this.scene.remove(KnowhowSelectDialogScene.KEY);
            }
        }));

        this.createKnowhowList();
    }

    createKnowhowList() {
        let g = this.add.graphics();
        g.fillStyle(0x777777);
        g.fillRect(210, 310, 380, 390);

        let list = this.add.container(215, 310);

        let y = 5;

        gameEngine.player.knowhows.forEach((knowhowId) => {
            let item = this.createKnowhowItem(knowhowId);
            list.add(item);
            item.setPosition(item.x, y);
            y += 80;
        });

        return list;
    }

    createKnowhowItem(id) {
        let knowhow = KNOWHOW[id];

        let item = this.add.container();

        let back = this.add.nineslice(0, 0, 370, 75, 'item_back', 30, 10).setOrigin(0);
        item.add(back);

        let name = this.add.text(12, 15, knowhow.name, {fontSize: 18});
        item.add(name);

        let description = this.add.text(12, 45, knowhow.description, {fontSize: 15});
        item.add(description);

        return item;
    }
}