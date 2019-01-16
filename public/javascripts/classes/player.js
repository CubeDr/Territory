class Player {
    constructor(id) {
        this.id = id;
        this.__loadPlayer();
    }

    update(dt, engine) {
        // update money
        this._money += (this._moneyIncreaseRate - this._moneyDecreaseRate) * dt;
        this._money = clipToRange(this._money, 0);
        // update population
        if(this._food > 0) {
            let popDelta = this._populationIncreaseRate * dt;
            this._population += popDelta;
            this._population = clipToRange(this._population, 0, this.populationMax);
        }
        // update food
        this._food += (this._foodIncreaseRate - this._foodDecreaseRate) * dt;
        this._food = clipToRange(this._food, 0, this.foodMax);
        // update army
        this._updateSec(dt);

        this._recalculateDeltas();
    }

    _updateSec(dt, engine) {
        this._dt += dt;
        while(this._dt >= 1) {
            this._dt -= 1;
            this.territories.forEach((t) => {
                let transferred = t.transferArmy();
                if(transferred) {
                    engine.emit('quantityChange', t)
                          .emit('qualityChange', t);
                }
            });
        }
    }

    _recalculateDeltas() {
        this._moneyIncreaseRate = 0;
        this._moneyDecreaseRate = 0;
        this._foodIncreaseRate = 0;
        this._foodDecreaseRate = 0;
        this._populationIncreaseRate = 0;
        this.territories.forEach((t) => {
            this._moneyIncreaseRate += t.moneyIncreaseRate;
            this._moneyDecreaseRate += t.moneyDecreaseRate;
            this._foodIncreaseRate += t.foodIncreaseRate;
            this._foodDecreaseRate += t.foodDecreaseRate;
            this._populationIncreaseRate += t.populationIncreaseRate;
        });
    }

    get populationMax() {
        return this.territories.map((t) => t.populationMax).reduce((a, b) => a+b, 0)
    }

    get foodMax() {
        return this.territories.map((t) => t.foodMax).reduce((a, b) => a+b, 0)
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
        this._money = 1000;
        this._food = 0;
        this._population = 100;

        this._dt = 0;

        this.__loadTerritories();
    }

    __loadTerritories() {
        this.territories = [ new Territory(this) ];
        this._recalculateDeltas();
    }
}