class FightScene extends Phaser.Scene {
    static get KEY() { return 'fightScene'; }

    constructor() {
        super({KEY: FightScene.KEY});

        // prepare
        this.state = 0;
    }

    init(config) {
        this.opponentId = config.opponentId;
        this.armies = config.armies;

        console.log(config);
    }
}