class FightEndDialogScene extends Phaser.Scene {
    static get KEY() { return 'FightEndDialogScene'; }

    constructor() {
        super({key: FightEndDialogScene.KEY});
    }

    init(config) {
        this.callback = config.callback;
        this.money = config.money;
        this.food = config.food;
        this.knowhows = config.knowhows;
    }

    preload() {
        this.load.image('background_dialog', 'assets/background_dialog.png');
        this.load.image('money_icon', 'assets/ui/resources/icon_coin.png');
        this.load.image('food_icon', 'assets/ui/resources/icon_food.png');
    }

    create() {
        let g = this.add.graphics();
        g.fillStyle(0x000000, 0.7);
        g.fillRect(0, IMAGE_HEIGHT, GAME_WIDTH, CAMERA_HEIGHT);
        ignoreEvents(g.setInteractive(new Phaser.Geom.Rectangle(), () => { return true; }));

        this.add.nineslice(
            250, 250, 300, 300, 'background_dialog', 30, 10
        );

        this.add.text(400, 270, '전투 종료!', {fontSize: 20}).setOrigin(0.5, 0);

        this.add.text(300, 300, '획득 자원');
        this.add.image(300, 350, 'money_icon').setScale(0.8);
        this.add.text(320, 338, this.money);
        this.add.image(300, 400, 'food_icon').setScale(0.8);
        this.add.text(320, 388, this.food);

        this.add.text(300, 430, '획득 노하우');
        let knowhowText = this.add.text(285, 460, '없음');
        if(this.knowhows.length > 0) {
            let text = '';
            this.knowhows.forEach((id) => {
                text += '[' + KNOWHOW[id].name + '] '
            });
            knowhowText.setText(text);
        }

        this.add.existing(new TextButton(this, 400, 540, '확인', {
            onClick: () => {
                this.scene.remove(FightEndDialogScene.KEY);
                this.callback();
            }
        }).setOrigin(0.5, 1));
    }
}