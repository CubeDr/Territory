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

        doAjax("POST", "player/defence", JSON.stringify({
            idTokenString: gameEngine.idToken,
            opponentId: this.opponentId
        }), (defenceString) => {
            console.log(defenceString);
            let defenceInfo = JSON.parse(defenceString);
            console.log(defenceInfo);
        });
    }

    create() {
        console.log("CREATE");
        this.add.text(100, 100, "ASDFASDFASDFSADF");
    }
}