let gameEngine = null;

class Engine extends Phaser.Scene {
    constructor() {
        super({key: 'engine'});

        // propery to handle events
        this._events = {};
        this._lastUpdate = -1000;
        this._lastUpload = -10000;
        this.userId = null;
        this.player = null;
        this.currentTime = 0;
    }

    init() {
        gameEngine = this;
    }

    create() {
        this.scene.launch('signin');
    }

    setPlayer(player) {
        this.player = player;
    }

    update(time) {
        this.currentTime = time;

        if(!this.player) return;
        while(time >= this._lastUpdate + UPDATE_CYCLE) {
            this.player.update(time, UPDATE_CYCLE / 1000, this);
            this._lastUpdate += UPDATE_CYCLE;
        }
        if(time >= this._lastUpload + UPLOAD_CYCLE) {
            this.uploadUser();
        }
    }

    registerFight(army) {
        let a = Math.min(army.quantity, army.to.quantity);
        let b = Math.max(army.quantity, army.to.quantity);
        let fightDuration = a * a / b / 10 * 1000;

        a = army.quantity * army.quality;
        b = army.to.quantity * army.to.quality;
        army.result = a > b;

        console.log(this);
        this.time.delayedCall(fightDuration, () => {
            this.emit('fightEnd', army);

            if(army.result) {
                console.log("Win");
                this.player.deltaMoney(army.to.reward.money);
                this.player.deltaFood(army.to.reward.food);
            } else {
                console.log("Lose");
            }
        }, army, this)
    }

    /* ===== PubSub Pattern methods ===== */
    on(eventName, callback) {
        if(this._events[eventName] == null)
            this._events[eventName] = [];
        // prevent duplicate callback register
        if(this._events[eventName].indexOf(callback) === -1)
            this._events[eventName].push(callback);
        return this;
    }

    off(eventName, callback) {
        if(this._events[eventName] == null)
            return this;
        let idx = this._events[eventName].indexOf(callback);
        if(idx === -1) return this;
        this._events[eventName].splice(idx, 1);
        return this;
    }

    emit(eventName, data) {
        if(this._events[eventName])
            this._events[eventName].forEach((callback) => callback(data));
        return this;
    }
    /* =================================== */

    uploadUser(callback) {
        this._lastUpload = this.currentTime;
        postUserResource(
            JSON.stringify({
            idTokenString: this.idToken,
            money: Math.floor(this.player.money),
            food: Math.floor(this.player.food),
            population: Math.floor(this.player.population),
            time: new Date().toISOString()
        }), callback);

        this.player.territories.forEach( (t) => {
            let data = {
                idTokenString: this.idToken,
                territoryId: t.id,
                quantity: t.army.quantity,
                quality: t.army.quality
            };
            postTerritoryResource(JSON.stringify(data));
        });
    }

    static calculateCost(quantity, quality, factor) {
        let armyFactor = quantity * quality / 100;

        let foodConsume = Math.ceil(factor * armyFactor * FIGHT_ARMY_FOOD);
        let moneyConsume = Math.ceil(factor * armyFactor * FIGHT_ARMY_MONEY);
        return {
            foodConsume: foodConsume,
            moneyConsume: moneyConsume
        }
    }
}