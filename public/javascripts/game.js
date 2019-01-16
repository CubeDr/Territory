var config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scene: [ TerritoryScene, WorldScene, WorldUIScene ],
    parent: '#gameCanvas'
};

var player = new Player(1);

var game = new Phaser.Game(config);
game.scene.start('territory', player.territories[0]);
game.scene.add('info', InfoScene, true, player);