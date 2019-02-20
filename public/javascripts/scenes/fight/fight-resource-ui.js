class FightResourceUIScene extends Phaser.Scene {
    static get KEY() { return 'FightResourceUIScene'; }

    constructor() {
        super({key: FightResourceUIScene.KEY });
    }

    preload() {
        this.load.image('money', 'assets/ui/resources/icon_coin.png');
        this.load.image('food', 'assets/ui/resources/icon_food.png');
    }

    create() {
        this.cameras.main.setPosition(800, 0);
        this.cameras.main.setSize(100, 900);
        this.cameras.main.setBackgroundColor('#000000');

        ignoreEvents(this.add.graphics().setInteractive(Phaser.Geom.Rectangle, () => { return true; }));

        this.add.existing(new TextButton(this, 50, 50, '[전투 종료]', {
            onClick: () => {
                console.log('종료');
            },
            fontSize: 20
        }).setOrigin(0.5));

        this.add.text(50, 120, '획득 자원').setOrigin(0.5);
        this.add.image(50, 150, 'money');
        this.add.image(50, 230, 'food');

        this.moneyText = this.add.text(50, 180, '0').setOrigin();
        this.foodText = this.add.text(50, 260, '0').setOrigin();
    }

    showResource(money, food) {
        this.moneyText.setText(money);
        this.foodText.setText(food);
    }
}