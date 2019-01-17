class AttackTerritorySelectDialogScene extends Phaser.Scene {
    static get KEY() { return 'attackTerritorySelectDialog'; }

    constructor() {
        super({key: AttackTerritorySelectDialogScene.KEY});
    }

    preload() {

    }

    create() {
        let g = this.add.graphics();
        g.fillStyle(0x000000, 0.7);
        g.fillRect(0, IMAGE_HEIGHT, GAME_WIDTH, CAMERA_HEIGHT);

        let textX = CAMERA_WIDTH / 2;
        let textY = CAMERA_HEIGHT / 4;
        // title text
        this.add.text(textX, textY, "병력을 출진시킬 영지를 선택하세요")
            .setOrigin(0.5, 1)
        // set dialog modal
            .setInteractive(new Phaser.Geom.Rectangle(), () => { return true; })
            .on('pointerdown',  (p, x, y, e) => e.stopPropagation())
            .on('pointerup',    (p, x, y, e) => e.stopPropagation())
            .on('pointermove',  (p, x, y, e) => e.stopPropagation())
            .on('pointerover',  (p, x, y, e) => e.stopPropagation())
            .on('pointerout',   (p, e) => e.stopPropagation());
    }
}
