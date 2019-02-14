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
    }
}