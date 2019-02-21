class FightTerritoryInfoDialog extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene);

        this.add(scene.add.nineslice(0, 0, 200, 100, 'dialog', 10, 10));
        this.icon1 = scene.add.image(30, 50, 'money');
        this.add(this.icon1);
        this.icon2 = scene.add.image(120, 50, 'food');
        this.add(this.icon2);
        this.text1 = scene.add.text(50, 42, '1234');
        this.add(this.text1);
        this.text2 = scene.add.text(140, 42, '1234');
        this.add(this.text2);
    }

    showDefenceInfo(quantity, quality) {
        this.icon1.setTexture('quantity');
        this.icon2.setTexture('quality');

        this.text1.setText(quantity);
        this.text2.setText(quality);

        this.visible = true;
    }

    showResourceInfo(money, food) {
        this.icon1.setTexture('money');
        this.icon2.setTexture('food');

        this.text1.setText(money);
        this.text2.setText(food);

        this.visible = true;
    }
}