class Player {
    constructor(id) {
        this.id = id;
        this.__loadPlayer();
    }

    attachListeners(eventBus) {
        this.eventBus = eventBus.on('deltaMoneyDecreaseRate', (data) => {
            this._moneyDecreaseRate += data.delta;
            this.eventBus.emit('changeMoneyDecreaseRate', this._moneyDecreaseRate);
        }).on('deltaPopulationMax', (data) => {
            this._populationMax += data.delta;
            eventBus.emit('changePopulationMax', this._populationMax);
        }).on('deltaFoodMax', (data) => {
            this._foodMax += data.delta;
            eventBus.emit('changeFoodMax', this._foodMax);
        }).on('deltaPopulationIncreaseRate', (data) => {
            this._populationIncreaseRate += data.delta;
            eventBus.emit('changePopulationIncreaseRate', this._populationIncreaseRate);
        }).on('deltaFoodIncreaseRate', (data) => {
            this._foodIncreaseRate += data.delta;
            eventBus.emit('changeFoodIncreaseRate', this._foodIncreaseRate);
        }).on('deltaFoodDecreaseRate', (data) => {
            this._foodDecreaseRate += data.delta;
            eventBus.emit('changeFoodDecreaseRate', this._foodDecreaseRate);
        });
    }

    update(dt) {
        // update money
        this._money += (this._moneyIncreaseRate - this._moneyDecreaseRate) * dt;
        this._money = clipToRange(this._money, 0);
        this.eventBus.emit('changeMoney', this._money);

        // update population
        this.deltaPopulation(this._populationIncreaseRate * dt);

        // update food
        let newFood = this._food + (this._foodIncreaseRate - parseInt(this._foodDecreaseRate)) * dt;
        newFood = clipToRange(newFood, 0, this.foodMax);
        if(newFood !== this._food)
            this.eventBus.emit('changeFood', newFood);
        this._food = newFood;
        // update army
        this._updateSec(dt, this.eventBus);

        // this._recalculateDeltas();
    }

    deltaMoney(moneyDelta) {
        this._money += moneyDelta;
        this.eventBus.emit('changeMoney', this._money);
    }

    deltaPopulation(populationDelta) {
        if(this._food <= 0) return false;
        let newPopulation = this._population + populationDelta;
        if(newPopulation < 0) return false;
        newPopulation = clipToRange(newPopulation, 0, this.populationMax);
        if(newPopulation !== this._population)
            this.eventBus.emit('changePopulation', newPopulation);
        let delta = newPopulation - this._population;
        this._population = newPopulation;

        this._moneyIncreaseRate += delta * DEFAULT_MONEY_INCREASE_FACTOR;
        this.eventBus.emit('changeMoneyIncreaseRate', this._moneyIncreaseRate);

        this._foodDecreaseRate += delta * DEFAULT_FOOD_DECREASE_FACTOR;
        this.eventBus.emit('changeFoodDecreaseRate', this._foodDecreaseRate);
        return true;
    }

    _updateSec(dt, engine) {
        let eventBus = this.eventBus;
        this._dt += dt;
        while(this._dt >= 1) {
            this._dt -= 1;
            this.territories.forEach((t) => {
                let transferred = t.transferArmy(engine);
                if(transferred) {
                    eventBus.emit('quantityChange', t)
                          .emit('qualityChange', t);
                }
            });
        }
    }

    _initializeAttributes() {
        this._moneyIncreaseRate = 0;
        this._moneyDecreaseRate = 0;
        this._foodIncreaseRate = 0;
        this._foodDecreaseRate = 0;
        this._foodMax = 0;
        this._populationIncreaseRate = 0;
        this._populationMax = 0;

        this.territories.forEach((t) => {
            this._moneyIncreaseRate += t.moneyIncreaseRate;
            this._moneyDecreaseRate += t.moneyDecreaseRate;
            this._foodIncreaseRate += t.foodIncreaseRate;
            this._foodDecreaseRate += t.foodDecreaseRate;
            this._foodMax += t.foodMax;
            this._populationIncreaseRate += t.populationIncreaseRate;
            this._populationMax += t.populationMax;
        });

        this._foodDecreaseRate += parseInt(this._population) * DEFAULT_FOOD_DECREASE_FACTOR;
        this._moneyIncreaseRate += parseInt(this._population) * DEFAULT_MONEY_INCREASE_FACTOR;
    }

    get populationMax() {
        return this._populationMax;
    }

    get foodMax() {
        return this._foodMax;
    }

    get money() { return this._money; }
    get food() { return this._food; }
    get population() { return this._population; }

    get moneyIncreaseRate() { return this._moneyIncreaseRate; }
    get moneyDecreaseRate() { return this._moneyDecreaseRate; }
    get foodIncreaseRate() { return this._foodIncreaseRate; }
    get foodDecreaseRate() { return this._foodDecreaseRate; }
    get populationIncreaseRate() { return this._populationIncreaseRate; }

    __loadPlayer() {
        this._money = 2000;
        this._food = 0;
        this._population = 390;
        this._dt = 0;
        this.enemies = [];
        this.__loadTerritories();

        this._initializeAttributes();
    }

    __loadTerritories() {
        this.territories = [ new Territory(this),
            new Territory(this, {x:1, y:0}),
            new Territory(this, {x:2, y:0}),
            new Territory(this, {x:3, y:0}),
            new Territory(this, {x:4, y:0}),
            new Territory(this, {x:5, y:0}),
            new Territory(this, {x:6, y:0}),
            new Territory(this, {x:7, y:0}),
            new Territory(this, {x:8, y:0}),
            new Territory(this, {x:9, y:0}) ];
    }

    getRandomEnemySpec() {
        let maxQuantity = 10;
        let maxQuality = 50;
        this.territories.forEach((t) => {
            if(t.army.quantity > maxQuantity) maxQuantity = t.army.quantity;
            if(t.army.quality > maxQuality) maxQuality = t.army.quality;
        });
        let quantity = maxQuantity + Math.floor(Math.random()*11) - 5;
        let quality = maxQuality + Math.floor(Math.random()*20) - 10;

        if(quantity <= 0) quantity = 1;
        if(quality <= 0) quality = 10;

        let factor = quantity * quality / 100;
        let reward = {
            money: factor * FIGHT_REWARD_MONEY,
            food: 100 * FIGHT_REWARD_FOOD
        };

        return {
            quantity: quantity,
            quality: quality,
            reward: reward
        };
    }
}