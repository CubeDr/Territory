class Engine extends Phaser.Scene {
    constructor() {
        super({key: 'engine'});

        // propery to handle events
        this._events = {};
        this._lastUpdate = -1000;
    }

    init(player) {
        this.player = player;
    }

    create() {
        this.scene.launch('territory', this.player.territories[0]);
        this.player.attachListeners(this);
    }

    update(time, dt) {
        this.player.update(dt/1000, this);
    }

    registerFight(army) {
        let a = Math.min(army.quantity, army.to.quantity);
        let b = Math.max(army.quantity, army.to.quantity);
        let fightDuration = a * a / b / 10 * 1000;

        a = army.quantity * army.quality;
        b = army.to.quantity * army.to.quality;
        army.result = a > b;

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
}