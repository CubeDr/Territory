class Territory {
    constructor(player, config={}) {
        this._player = player;
        this._army = getValue(config.army, {
            quantity: 0,
            quality: 70
        });
        this._x = getValue(config.x, 0);
        this._y = getValue(config.y, 0);
        this._map = getValue(config.map, [
            ['house', 'house', 'house', 'house', 'product', 'product', 'post', 'barrack'],
            ['product', 'house', 'house', 'house', 'product', 'product', 'grass', 'grass'],
            ['product', 'house', 'house', 'house', 'product', 'product', 'grass', 'grass'],
            ['product', 'house', 'house', 'house', 'product', 'product', 'grass', 'grass'],
            ['product', 'house', 'house', 'house', 'product', 'product', 'grass', 'grass'],
            ['product', 'house', 'landmark', 'house', 'grass', 'grass', 'grass', 'grass'],
            ['product', 'house', 'landmark', 'house', 'grass', 'grass', 'grass', 'grass'],
            ['product', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass']
        ]);
        this._updateAttributes();

        // gameObject handling this territory from WorldScene
        // this property is to easily track gameObject from WorldUIScene.
        // can be null when WorldScene is not active.
        this.gameObject = null;
    }

    build(x, y, what, engine) {
        this._map[y][x] = what;
        /* Update Attributes
         * 1. foodMax
         * 2. populationMax
         * 3. armyQuantityMax
         * 4. moneyDecreaseRate
         * 5. foodIncreaseRate
         * 6. moneyIncreaseRate
         * 7. foodDecreaseRate
         * 8. populationIncreaseRate
         */
        let self = this;
        switch(what) {
            case Building.BARRACK.type:
                // moneyDecreaseRate
                this._moneyDecreaseRate += Building.BARRACK.maintain;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: Building.BARRACK.maintain
                });
                break;
            case Building.POST.type:
                // moneyDecreaseRate
                this._moneyDecreaseRate += Building.POST.maintain;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: Building.POST.maintain
                });
                // armyQuantityMax
                this._armyQuantityMax += 10;
                engine.emit('changeQuantityMax', this);
                break;
            case Building.TRAIN.type:
                // moneyDecreaseRate
                this._moneyDecreaseRate += Building.TRAIN.maintain;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: Building.TRAIN.maintain
                });
                this._qualityIncrement += 10;
                break;
            case Building.HOUSE.type:
                // moneyDecreaseRate
                this._moneyDecreaseRate += Building.HOUSE.maintain;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: Building.HOUSE.maintain
                });
                // populationMax
                this._populationMax += 10;
                engine.emit('deltaPopulationMax', {
                    territory: self,
                    delta: 10
                });
                break;
            case Building.PRODUCT.type:
                // moneyDecreaseRate
                this._moneyDecreaseRate += Building.PRODUCT.maintain;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: Building.PRODUCT.maintain
                });
                // foodIncreaseRate
                this._foodIncreaseRate += 25;
                engine.emit('deltaFoodIncreaseRate', {
                    territory: self,
                    delta: 25
                });
                break;
            case Building.SAVE.type:
                // moneyDecreaseRate
                this._moneyDecreaseRate += Building.SAVE.maintain;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: Building.SAVE.maintain
                });
                // foodMax
                this._foodMax += 100;
                engine.emit('deltaFoodMax', {
                    territory: self,
                    delta: 100
                });
                break;
            case Building.LANDMARK.type:
                // moneyDecreaseRate
                this._moneyDecreaseRate += Building.LANDMARK.maintain;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: Building.LANDMARK.maintain
                });
                // populationIncreaseRate
                this._populationIncreaseRate += 1;
                engine.emit('deltaPopulationIncreaseRate', {
                    territory: self,
                    delta: 1
                });
                break;
            case Building.MUSEUM.type:
                // moneyDecreaseRate
                this._moneyDecreaseRate += Building.MUSEUM.maintain;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: Building.MUSEUM.maintain
                });
                break;
        }
    }

    _updateAttributes() {
        this._foodMax = Territory.__foodMaxFrom(this.map);
        this._populationMax = Territory.__populationMaxFrom(this.map);
        this._armyQuantityMax = Territory.__armyQuantityMaxFrom(this.map);
        this._moneyDecreaseRate = Territory.__moneyDecreaseRateFrom(this.map);
        this._foodIncreaseRate = Territory.__foodIncreaseRateFrom(this.map);
        this._moneyIncreaseRate = Territory.__moneyIncreaseRateFrom(this.player.population);
        this._foodDecreaseRate = Territory.__foodDecreaseRateFrom(this.player.population, this.army);
        this._populationIncreaseRate = Territory.__populationIncreaseRateFrom(this.player.food, this.map);
        this._qualityIncrement = Territory.__qualityIncrementFrom(this.map);

    }

    get x() { return this._x; }
    get y() { return this._y; }
    get player() { return this._player; }
    get army() { return this._army; }
    get map() { return this._map; }
    get foodMax() { return this._foodMax; }
    get populationMax() { return this._populationMax; }
    get armyQuantityMax() { return this._armyQuantityMax; }
    get moneyIncreaseRate() { return this._moneyIncreaseRate; }
    get moneyDecreaseRate() { return this._moneyDecreaseRate; }
    get foodIncreaseRate() { return this._foodIncreaseRate; }
    get foodDecreaseRate() { return this._foodDecreaseRate; }
    get populationIncreaseRate() {
        return this._populationIncreaseRate;
    }

    deltaArmy(eventBus, deltaQuantity) {
        this._army.quantity -= deltaQuantity;
        eventBus.emit('changeQuantity', this);

        let deltaArmyFactor = deltaQuantity * this._army.quality / 100;

        eventBus.emit('deltaMoneyDecreaseRate', {
            territory: this,
            delta: -deltaArmyFactor * ARMY_MONEY_DECREASE_FACTOR
        });

        eventBus.emit('deltaFoodDecreaseRate', {
            territory: this,
            delta: -deltaArmyFactor * ARMY_FOOD_DECREASE_FACTOR
        });
    }

    transferArmy(eventBus) {
        /* Transfer Army Logic
         *  1. Remove effect to player of this.army
         *  2. Transfer army from population to army
         *  3. Re affect player
         */

        let armyFactor = this._army.quantity * (this._army.quality / 100);

        // 1. Remove effect to player of this.army
        eventBus.emit('deltaMoneyDecreaseRate', {
            territory: this,
            delta: -armyFactor * ARMY_MONEY_DECREASE_FACTOR
        }).emit('deltaFoodDecreaseRate', {
            territory: this,
            delta: -armyFactor * ARMY_FOOD_DECREASE_FACTOR
        });

        // 2. Transfer army from population to army
        let factor = 0;
        this.map.forEach( (row) => {
            row.forEach((b) => {
                if(b === Building.BARRACK.type) factor += DEFAULT_ARMY_TRANSFER_FACTOR;
            })
        });

        if(this.player.population > 0) {
            let t = factor;
            let max = this.armyQuantityMax;
            if(t + this.army.quantity > max) t = max - this.army.quantity;
            if(t > 0) {
                let newQuality = DEFAULT_ARMY_NEW_QUALITY + this._qualityIncrement;
                this._army.quality = this._army.quality * this._army.quantity + newQuality * t;
                this._army.quantity += t;
                this._army.quality /= this._army.quantity;
            }

            // 3. Re affect player
            /* Rate change calculation
             * moneyDecreaseRate = quantity * (quality / 100) * ARMY_MONEY_DECREASE_FACTOR
             * foodDecreaseRate = quantity * (quality / 100) * ARMY_FOOD_DECREASE_FACTOR
             */
            this.player.deltaPopulation(-t);
            armyFactor = this._army.quantity * (this._army.quality / 100);

            eventBus.emit('deltaMoneyDecreaseRate', {
                territory: self,
                delta: armyFactor * ARMY_MONEY_DECREASE_FACTOR
            }).emit('deltaFoodDecreaseRate', {
                territory: self,
                delta: armyFactor * ARMY_FOOD_DECREASE_FACTOR
            });
            eventBus.emit('changeQuantity', this);

            if(t !== 0) {
                eventBus.emit('changeQuality', this);
                return true;
            }
        }

        return false;
    }

    static __foodMaxFrom(map) {
        let count = 10;
        map.forEach((row) => {
            row.forEach((b) => {
                if(b === 'save') count += 100;
            })
        });
        return count;
    }

    static __populationMaxFrom(map) {
        let count = 0;
        map.forEach((row) => {
            row.forEach((b) => {
                if(b === 'house') count += 10;
            })
        });
        return count;
    }

    static __armyQuantityMaxFrom(map) {
        let count = 0;
        map.forEach(function(row) {
            row.forEach(function(b) {
                if(b === Building.POST.type) count += 10;
            })
        });
        return count;
    }

    static __moneyIncreaseRateFrom(population) {
        return 0;
    }

    static __moneyDecreaseRateFrom(map) {
        let maintain = 0;
        map.forEach(function(row) {
            row.forEach(function(b) {
                if(b === 'grass') return;
                maintain += Building[b.toUpperCase()].maintain;
            })
        });
        return maintain;
    }

    static __foodIncreaseRateFrom(map) {
        let count = 0;
        map.forEach(function(row) {
            row.forEach(function(b) {
                if(b === 'product') count+=25;
            })
        });
        return count;
    }

    static __foodDecreaseRateFrom(population, army) {
        return parseInt(army.quantity) * ARMY_FOOD_DECREASE_FACTOR * army.quality / 100;
    }

    static __populationIncreaseRateFrom(food, map) {
        let count = 0.1;
        map.forEach((row) => {
            row.forEach((b) => {
                if(b === 'landmark') count += 1;
            })
        });
        return count;
    }

    static __qualityIncrementFrom(map) {
        let count = 0;
        map.forEach((r) => {
            r.forEach((b) => {
                if(b === Building.TRAIN.type) count += 10;
            })
        });
        return count;
    }
}