class Territory {
    constructor(player, config={}) {
        this._player = player;
        this._army = {
            quantity: getValue(config.quantity, 0),
            quality: getValue(config.quality, 0)
        };
        this.id = config.id;
        this._x = getValue(config.x, 0);
        this._y = getValue(config.y, 0);
        this._buildings = [];
        for(let i=0; i<8; i++) this._buildings.push([]);

        if(config.buildings) config.buildings.forEach((b) => {
            this._buildings[b.y][b.x] = b;
        });

        this._updateAttributes();

        // gameObject handling this territory from WorldScene
        // this property is to easily track gameObject from WorldUIScene.
        // can be null when WorldScene is not active.
        this.gameObject = null;
        this.lastTransfer = 0;
    }

    update(time, eventBus) {
        while(time > this.lastTransfer + DEFAULT_ARMY_TRANSFER_CYCLE) {
            this.transferArmy(eventBus);
            this.lastTransfer += DEFAULT_ARMY_TRANSFER_CYCLE;
        }
    }

    build(id, x, y, what, engine) {
        this._buildings[y][x] = {
            id: id,
            x: x,
            y: y,
            type: BUILDING_ID[what]
        };
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
        let delta = 0;
        switch(what) {
            case Building.BARRACK.type:
                // moneyDecreaseRate
                delta = Building.BARRACK.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.POST.type:
                // moneyDecreaseRate
                delta = Building.POST.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // armyQuantityMax
                delta = 10;
                this._armyQuantityMax += delta;
                engine.emit('changeQuantityMax', this);
                break;
            case Building.TRAIN.type:
                // moneyDecreaseRate
                delta = Building.TRAIN.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // quality
                delta = 10;
                this._qualityIncrement += delta;
                break;
            case Building.HOUSE.type:
                // moneyDecreaseRate
                delta = Building.HOUSE.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // populationMax
                delta = 10;
                this._populationMax += delta;
                engine.emit('deltaPopulationMax', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.PRODUCT.type:
                // moneyDecreaseRate
                delta = Building.PRODUCT.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // foodIncreaseRate
                delta = 25;
                this._foodIncreaseRate += delta;
                engine.emit('deltaFoodIncreaseRate', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.SAVE.type:
                // moneyDecreaseRate
                delta = Building.SAVE.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // foodMax
                delta = 100;
                this._foodMax += delta;
                engine.emit('deltaFoodMax', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.LANDMARK.type:
                // moneyDecreaseRate
                delta = Building.LANDMARK.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // populationIncreaseRate
                delta = 1;
                this._populationIncreaseRate += delta;
                engine.emit('deltaPopulationIncreaseRate', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.MUSEUM.type:
                // moneyDecreaseRate
                delta = Building.MUSEUM.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                break;
        }
    }

    remove(x, y, engine) {
        let what = BUILDING_TYPE[this._buildings[y][x].type];
        this._buildings[y][x] = null;
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
        let delta = 0;
        switch(what) {
            case Building.BARRACK.type:
                // moneyDecreaseRate
                delta = -Building.BARRACK.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.POST.type:
                // moneyDecreaseRate
                delta = -Building.POST.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // armyQuantityMax
                delta = -10;
                this._armyQuantityMax += delta;
                engine.emit('changeQuantityMax', this);
                break;
            case Building.TRAIN.type:
                // moneyDecreaseRate
                delta = -Building.TRAIN.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // quality
                delta = -10;
                this._qualityIncrement += delta;
                break;
            case Building.HOUSE.type:
                // moneyDecreaseRate
                delta = -Building.HOUSE.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // populationMax
                delta = -10;
                this._populationMax += delta;
                engine.emit('deltaPopulationMax', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.PRODUCT.type:
                // moneyDecreaseRate
                delta = -Building.PRODUCT.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // foodIncreaseRate
                delta = -25;
                this._foodIncreaseRate += delta;
                engine.emit('deltaFoodIncreaseRate', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.SAVE.type:
                // moneyDecreaseRate
                delta = -Building.SAVE.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // foodMax
                delta = -100;
                this._foodMax += delta;
                engine.emit('deltaFoodMax', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.LANDMARK.type:
                // moneyDecreaseRate
                delta = -Building.LANDMARK.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                // populationIncreaseRate
                delta = -1;
                this._populationIncreaseRate += delta;
                engine.emit('deltaPopulationIncreaseRate', {
                    territory: self,
                    delta: delta
                });
                break;
            case Building.MUSEUM.type:
                // moneyDecreaseRate
                delta = -Building.MUSEUM.maintain;
                this._moneyDecreaseRate += delta;
                engine.emit('deltaMoneyDecreaseRate', {
                    territory: self,
                    delta: delta
                });
                break;
        }
    }

    delete(engine) {
        for(let y=0; y<8; y++) {
            for(let x=0; x<8; x++) {
                this.remove(x, y, engine);
            }
        }
        this.deltaArmy(engine, this._army.quantity);
        // 기본 인구 증가량 삭제
        engine.emit('deltaPopulationIncreaseRate', {
            territory: self,
            delta: -DEFAULT_POPULATION_INCREASE_FACTOR
        });
    }

    _updateAttributes() {
        this._foodMax = Territory.__foodMaxFrom(this._buildings);
        this._populationMax = Territory.__populationMaxFrom(this._buildings);
        this._armyQuantityMax = Territory.__armyQuantityMaxFrom(this._buildings);
        this._moneyDecreaseRate = Territory.__moneyDecreaseRateFrom(this._buildings);
        this._foodIncreaseRate = Territory.__foodIncreaseRateFrom(this._buildings);
        this._moneyIncreaseRate = Territory.__moneyIncreaseRateFrom(this.player.population);
        this._foodDecreaseRate = Territory.__foodDecreaseRateFrom(this.player.population, this.army);
        this._populationIncreaseRate = Territory.__populationIncreaseRateFrom(this.player.food, this._buildings);
        this._qualityIncrement = Territory.__qualityIncrementFrom(this._buildings);

    }

    get x() { return this._x; }
    get y() { return this._y; }
    get player() { return this._player; }
    get army() { return this._army; }
    // get map() { return this._map; }
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
        this._buildings.forEach( (row) => {
            row.forEach((b) => {
                if(b != null && BUILDING_TYPE[b.type] === Building.BARRACK.type) factor += 1;
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
            if(t !== 0)
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

    static __foodMaxFrom(buildings) {
        let count = 10;
        buildings.forEach((row) => {
            row.forEach((b) => {
                if(b != null && BUILDING_TYPE[b.type] === 'save') count += 100;
            })
        });
        return count;
    }

    static __populationMaxFrom(buildings) {
        let count = 0;
        buildings.forEach((row) => {
            row.forEach((b) => {
                if(b != null && BUILDING_TYPE[b.type] === 'house') count += 10;
            })
        });
        return count;
    }

    static __armyQuantityMaxFrom(buildings) {
        let count = 0;
        buildings.forEach(function(row) {
            row.forEach(function(b) {
                if(b != null && BUILDING_TYPE[b.type] === Building.POST.type) count += 10;
            })
        });
        return count;
    }

    static __moneyIncreaseRateFrom(population) {
        return 0;
    }

    static __moneyDecreaseRateFrom(buildings) {
        let maintain = 0;
        buildings.forEach(function(row) {
            row.forEach(function(b) {
                if(b == null) return;
                maintain += Building[BUILDING_TYPE[b.type].toUpperCase()].maintain;
            })
        });
        return maintain;
    }

    static __foodIncreaseRateFrom(buildings) {
        let count = 0;
        buildings.forEach(function(row) {
            row.forEach(function(b) {
                if(b != null && BUILDING_TYPE[b.type] === 'product') count+=25;
            })
        });
        return count;
    }

    static __foodDecreaseRateFrom(population, army) {
        return parseInt(army.quantity) * ARMY_FOOD_DECREASE_FACTOR * army.quality / 100;
    }

    static __populationIncreaseRateFrom(food, buildings) {
        let count = DEFAULT_POPULATION_INCREASE_FACTOR;
        buildings.forEach((row) => {
            row.forEach((b) => {
                if(b != null && BUILDING_TYPE[b.type] === 'landmark') count += 1;
            })
        });
        return count;
    }

    static __qualityIncrementFrom(buildings) {
        let count = 0;
        buildings.forEach((r) => {
            r.forEach((b) => {
                if(b != null && BUILDING_TYPE[b.type] === Building.TRAIN.type) count += 10;
            })
        });
        return count;
    }
}