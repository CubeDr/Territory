class AttackQuantitySelectDialogScene extends Phaser.Scene {
    static get KEY() { return 'attackQuantitySelectDialog'; }

    constructor(props) {
        super({key: AttackQuantitySelectDialogScene.KEY});
    }

    init(territory) {
        this.territory = territory;
    }
}