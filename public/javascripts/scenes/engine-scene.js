class Engine extends Phaser.Scene {
    constructor() {
        super({key: 'engine'});

        // propery to handle events
        this._events = {};
    }

    init(player) {
        this.player = player;
    }

    create() {
        this.scene.launch('territory', this.player.territories[0]);
        this.player.attachListeners(this);
    }

    /* ===== PubSub Pattern methods ===== */
    on(eventName, callback) {
        if(this._events[eventName] == null)
            this._events[eventName] = [];
        this._events[eventName].push(callback);
        return this;
    }

    emit(eventName, data) {
        if(this._events[eventName])
            this._events[eventName].forEach((callback) => callback(data));
        return this;
    }
    /* =================================== */
}