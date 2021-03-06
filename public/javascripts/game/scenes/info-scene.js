class InfoScene extends Phaser.Scene {
    constructor() {
        super({key: 'info'});
    }

    init(player) {
        this.player = player;
    }

    preload() {
        this.load.image('coin', 'assets/ui/resources/icon_coin.png');
        this.load.image('food', 'assets/ui/resources/icon_food.png');
        this.load.image('population', 'assets/ui/resources/icon_population.png');
        this.load.image('quality', 'assets/ui/resources/icon_quality.png');
        this.load.image('quantity', 'assets/ui/resources/icon_quantity.png');
    }

    create() {
        this.coinIcon = this.add.image(50, 40, 'coin');
        this.foodIcon = this.add.image(170, 40, 'food');
        this.populationIcon = this.add.image(320, 40, 'population');
        this.quantityIcon = this.add.image(500, 40, 'quantity');
        this.qualityIcon = this.add.image(650, 40, 'quality');

        this.moneyText = this.add.text(80, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);
        this.foodText = this.add.text(200, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);
        this.populationText = this.add.text(350, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);
        this.quantityText = this.add.text(530, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);
        this.qualityText = this.add.text(680, 40, '0', {fontSize: 18}).setOrigin(0, 0.5);

        this.moneyIncreaseText = this.add.text(88, 70, '▲0', {color: 'green'}).setOrigin(1, 0.5);
        this.moneyDecreaseText = this.add.text(92, 70, '▼0', {color: 'red'}).setOrigin(0, 0.5);
        this.foodIncreaseText = this.add.text(228, 70, '▲0', {color: 'green'}).setOrigin(1, 0.5);
        this.foodDecreaseText = this.add.text(232, 70, '▼0', {color: 'red'}).setOrigin(0, 0.5);
        this.populationIncreaseText = this.add.text(380, 70, '▲0', {color: 'green'}).setOrigin(0, 0.5);

        let self = this;
        this.scene.get('engine')
          .on('changeMoney', (newCoin) => {
            self.moneyText.setText(parseInt(newCoin));
        }).on('changeFood', (newFood) => {
            let max = 0;
            if(this.show === 'territory') max = self.data.player.foodMax;
            else if(this.show === 'player') max = self.data.foodMax;
            InfoScene._setValueMaxText(self.foodText, newFood, max);
        }).on('changePopulation', (newPopulation) => {
            let max = 0;
            if(this.show === 'territory') max = self.data.player.populationMax;
            else if(this.show === 'player') max = self.data.populationMax;
            InfoScene._setValueMaxText(self.populationText, newPopulation, max);
        }).on('changeQuantity', (territory) => {
            if(self.show !== 'territory') return;
            if(this.data !== territory) return;
            InfoScene._setValueMaxText(self.quantityText, territory.army.quantity, territory.armyQuantityMax);
        }).on('changeQuality', (territory) => {
            if(self.show !== 'territory') return;
            if(this.data !== territory) return;
            self.qualityText.setText(parseInt(territory.army.quality));
        }).on('changeQuantityMax', (territory) => {
            if(self.show !== 'territory') return;
            if(this.data !== territory) return;
            InfoScene._setValueMaxText(self.quantityText,
                territory.army.quantity,
                territory.armyQuantityMax);
        }).on('changePopulationMax', (max) => {
            let p = 0;
            if(this.show === 'territory') p = self.data.player.population;
            else if(this.show === 'player') p = self.data.population;
            InfoScene._setValueMaxText(self.populationText, p, max);
        }).on('changeFoodMax', (max) => {
            let f = 0;
            if(this.show === 'territory') f = self.data.player.food;
            else if(this.show === 'player') f = self.data.food;
            InfoScene._setValueMaxText(self.foodText, f, max);
        }).on('showInfo', (data) => {
            self.show = data.type;
            self.data = data.data;

            if(data.type === 'territory') self._showTerritory(data.data);
            else if(data.type === 'player') self._showPlayer(data.data);
        }).on('changeMoneyIncreaseRate', (newRate) => {
            this.moneyIncreaseText.setText('▲' + parseInt(newRate));
        }).on('changeMoneyDecreaseRate', (newRate) => {
            this.moneyDecreaseText.setText('▼' + parseInt(newRate));
        }).on('changeFoodIncreaseRate', (newRate) => {
            this.foodIncreaseText.setText('▲' + parseInt(newRate));
        }).on('changeFoodDecreaseRate', (newRate) => {
            this.foodDecreaseText.setText('▼' + parseInt(newRate));
        }).on('changePopulationIncreaseRate', (newRate) => {
            this.populationIncreaseText.setText('▲' + getDecimal(newRate, 2));
        }).emit('sceneLoaded', 'info');
    }

    _showTerritory(territory) {
        this.show = 'territory';
        this.data = territory;
        this._setTerritoryInfoVisibility(true);

        this._showCommonResource(territory.player);

        InfoScene._setValueMaxText(this.quantityText,
            territory.army.quantity,
            territory.armyQuantityMax);
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
        InfoScene._setValueMaxText(this.foodText,
            player.food,
            player.foodMax);
        InfoScene._setValueMaxText(this.populationText,
            player.population,
            player.populationMax);

        this.moneyIncreaseText.setText('▲' + parseInt(this.player.moneyIncreaseRate));
        this.moneyDecreaseText.setText('▼' + parseInt(this.player.moneyDecreaseRate));
        this.foodIncreaseText.setText('▲' + parseInt(this.player.foodIncreaseRate));
        this.foodDecreaseText.setText('▼' + parseInt(this.player.foodDecreaseRate));
        this.populationIncreaseText.setText('▲' + getDecimal(this.player.populationIncreaseRate, 2));
    }

    _setTerritoryInfoVisibility(visible) {
        this.quantityIcon.setVisible(visible);
        this.quantityText.setVisible(visible);
        this.qualityIcon.setVisible(visible);
        this.qualityText.setVisible(visible);
    }

    static _setValueMaxText(textView, value, max) {
        textView.setText(parseInt(value) + " / " + parseInt(max));
    }
}