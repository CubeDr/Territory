class InfoScene extends Phaser.Scene {
    constructor() {
        super({key: 'info'});
    }

    init(player) {
        this.player = player;
    }

    preload() {
        this.load.image('coin', 'assets/ui/resources/coin.png');
        this.load.image('food', 'assets/ui/resources/food.png');
        this.load.image('population', 'assets/ui/resources/population.png');
        this.load.image('quality', 'assets/ui/resources/quality.png');
        this.load.image('quantity', 'assets/ui/resources/quantity.png');
    }

    create() {
        this.coinIcon = this.add.image(50, 40, 'coin');
        this.foodIcon = this.add.image(200, 40, 'food');
        this.populationIcon = this.add.image(350, 40, 'population');
        this.quantityIcon = this.add.image(500, 40, 'quantity');
        this.qualityIcon = this.add.image(650, 40, 'quality');

        this.moneyText = this.add.text(80, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);
        this.foodText = this.add.text(230, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);
        this.populationText = this.add.text(380, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);
        this.quantityText = this.add.text(530, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);
        this.qualityText = this.add.text(680, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);

        this.moneyIncreaseText = this.add.text(88, 70, '▲0', {color: 'green'}).setOrigin(1, 0.5);
        this.moneyDecreaseText = this.add.text(92, 70, '▼0', {color: 'red'}).setOrigin(0, 0.5);
        this.foodIncreaseText = this.add.text(258, 70, '▲0', {color: 'green'}).setOrigin(1, 0.5);
        this.foodDecreaseText = this.add.text(262, 70, '▼0', {color: 'red'}).setOrigin(0, 0.5);
        this.populationIncreaseText = this.add.text(410, 70, '▲0', {color: 'green'}).setOrigin(0, 0.5);

        let self = this;
        this.scene.get('engine').on('changeMoney', (newCoin) => {
            self.moneyText.setText(parseInt(newCoin));
        }).on('changeFood', (newFood) => {
            self.foodText.setText(parseInt(newFood));
        }).on('changePopulation', (newPopulation) => {
            self.populationText.setText(parseInt(newPopulation));
        }).on('changeQuantity', (territory) => {
            if(self.show !== 'territory') return;
            if(this.data !== territory) return;
            self.quantityText.setText(parseInt(territory.quantity));
        }).on('changeQuality', (territory) => {
            if(self.show !== 'territory') return;
            if(this.data !== territory) return;
            self.qualityText.setText(parseInt(territory.quality));
        }).on('showInfo', (data) => {
            console.log('event received');
            self.show = data.type;
            self.data = data.data;

            if(data.type === 'territory') self._showTerritory(data.data);
            else if(data.type === 'player') self._showPlayer(data.data);
        }).emit('sceneLoaded', 'info');
    }

    update(time, dt) {
        this.player.update(dt/1000, this.scene.get('engine'));
    }

    _showTerritory(territory) {
        this.show = 'territory';
        this.data = territory;
        this._setTerritoryInfoVisibility(true);

        this._showCommonResource(territory.player);

        this.quantityText.setText(parseInt(territory.army.quantity) + " / " + territory.armyQuantityMax);
        this.qualityText.setText(parseInt(territory.army.quality));
    }

    _showPlayer(player) {
        this.show = 'player';
        this.data = player;
        this._setTerritoryInfoVisibility(false);

        this._showCommonResource(player);
    }

    _showCommonResource(player) {
        this.moneyText.setText(parseInt(player.money));
        this.foodText.setText(parseInt(player.food) + " / " + player.foodMax);
        this.populationText.setText(parseInt(player.population) + " / " + player.populationMax);

        this.moneyIncreaseText.setText('▲' + this.player.moneyIncreaseRate);
        this.moneyDecreaseText.setText('▼' + this.player.moneyDecreaseRate);
        this.foodIncreaseText.setText('▲' + this.player.foodIncreaseRate);
        this.foodDecreaseText.setText('▼' + this.player.foodDecreaseRate);
        this.populationIncreaseText.setText('▲' + this.player.populationIncreaseRate);
    }

    _setTerritoryInfoVisibility(visible) {
        this.quantityIcon.setVisible(visible);
        this.quantityText.setVisible(visible);
        this.qualityIcon.setVisible(visible);
        this.qualityText.setVisible(visible);
    }
}