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
            let defenceInfo = JSON.parse(defenceString);
            let boundary = MinimapDialog._getTerritoryBoundary(defenceInfo);
            // extend boundary to fill map
            while(boundary.maxX - boundary.minX + 1 < 8) {
                boundary.maxX++;
                boundary.minX--;
            }
            while(boundary.maxY - boundary.minY + 1 < 8) {
                boundary.maxY++;
                boundary.minY--;
            }
            console.log(boundary);
        });
    }

    create() {
        console.log("CREATE");
        this.add.text(100, 100, "ASDFASDFASDFSADF");
    }
}