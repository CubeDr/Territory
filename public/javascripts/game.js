var config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: [ Engine, TerritoryScene, WorldScene, WorldUIScene, InfoScene ],
    parent: '#gameCanvas'
};

var player = new Player(1);

var game = new Phaser.Game(config);
game.scene.start('engine', player.territories[0]);