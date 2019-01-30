var config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: [ Engine, SigninScene,
        TerritoryScene, WorldScene, InfoScene,
        WorldUIScene
    ],
    plugins: {
        global: [ NineSlice.Plugin.DefaultCfg ]
    },
    parent: 'gameCanvas'
};

var player = new Player(1);

var game = new Phaser.Game(config);
game.scene.start('engine', player);