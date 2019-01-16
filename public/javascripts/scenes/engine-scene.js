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
        this.scene.launch('territory', player.territories[0]);
    }

    /* ===== PubSub Pattern methods ===== */
    on(eventName, callback) {
        console.log('register ' + eventName);
        if(this._events[eventName] == null)
            this._events[eventName] = [];
        this._events[eventName].push(callback);
        return this;
    }

    emit(eventName, data) {
        console.log('emit ' + eventName);
        if(this._events[eventName])
            this._events[eventName].forEach((callback) => callback(data));
        return this;
    }
    /* =================================== */
}