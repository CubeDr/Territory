class SigninScene extends Phaser.Scene {
    constructor() {
        super({key: 'signin'});
    }

    preload() {
        this.load.image('background', 'assets/signin/awesome_background.jpg');
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0);
        this.add.rectangle(450, 200, 900, 200, 0).setAlpha(0.7);
        this.add.text(450, 200, 'TERRITORY', {
            fontSize: 70
        }).setOrigin(0.5);
        this.add.text(900, 900, '배경: 구글에 awesome background 검색ㅎ', {
            color: '#999999'
        }).setOrigin(1, 1);

        gameEngine.on('sign in', (playerInfo) => {
            console.log(playerInfo);
            gameEngine.userId = playerInfo.id;
            console.log(playerInfo.id);

            // TODO load player
            let player = new Player(playerInfo.id);

            gameEngine.setPlayer(player);
            this.scene.start('territory', player.territories[0]);
        });
    }
}