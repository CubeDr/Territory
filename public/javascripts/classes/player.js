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

    sendArmy(fromTerritory, toBandit, quantity, moneyConsume, foodConsume) {
        toBandit.state = 'attacked';

        fromTerritory.deltaArmy(this.eventBus, quantity);
        this.deltaMoney(-moneyConsume);
        this.deltaFood(-foodConsume);

        let army = {
            from: fromTerritory,
            to: toBandit,
            sprite: null,
            start: Date.now(),
            quantity: quantity,
            quality: fromTerritory.army.quality
        };
        this.runningArmies.push(army);
        this.eventBus.emit('runArmy', army);
    }

    deleteTerritory(territory) {
        territory.delete(this.eventBus);
        this.territories.splice(
            this.territories.indexOf(territory), 1
        );
    }

    update(time, dt) {
        // console.log(this.moneyIncreaseRate, this.moneyDecreaseRate, this.foodIncreaseRate, this.foodDecreaseRate);
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
        this.territories.forEach((t) => {
            t.update(time, this.eventBus);
        });
    }

    deltaMoney(moneyDelta) {
        this._money += moneyDelta;
        this.eventBus.emit('changeMoney', this._money);
    }

    deltaFood(foodDelta) {
        this._food += foodDelta;
        this.eventBus.emit('changeFood', this._food);
    }

    deltaPopulation(populationDelta) {
        if(this._food <= 0) populationDelta = 0;
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
        this._population = 1800;
        this._dt = 0;
        this.enemies = [];
        // list of armies currently attacking bandits
        // from: Territory this army started from
        // to: Bandit this army is heading to
        // sprite: Sprite gameobject of this army. null if not on world scene.
        // start: time that army started to move. used to calculate current position
        // quantity, quality: info of army
        this.runningArmies = [];
        this.fightingArmies = [];
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
            money: Math.ceil(factor * FIGHT_REWARD_MONEY),
            food: Math.ceil(factor * FIGHT_REWARD_FOOD)
        };

        return {
            quantity: quantity,
            quality: quality,
            reward: reward,
            state: 'idle'
        };
    }
}