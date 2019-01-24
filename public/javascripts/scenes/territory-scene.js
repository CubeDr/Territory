var TerritoryScene = {
    key: 'territory',
    init: init,
    preload: preload,
    create: create,
    update: update
};

var map;
var mapWidth = 8;
var mapHeight = 8;

var territory = null;

var edit = {
    object: null,
    over: null,
    cost: 0,
    enoughMoney: false,
    placable: false
};

function init(territoryData) {
    territory = territoryData;
}

function preload() {
    if(!this.scene.isActive('info'))
        this.scene.launch('info', territory.player);

    this.engine = this.scene.get('engine');

    this.load.image('grass', 'assets/grass.jpg');
    this.load.image(Building.BARRACK.type, 'assets/barrack.jpg');
    this.load.image(Building.POST.type, 'assets/post.png');
    this.load.image(Building.TRAIN.type, 'assets/train.jpg');
    this.load.image(Building.HOUSE.type, 'assets/house.png');
    this.load.image(Building.PRODUCT.type, 'assets/product.jpg');
    this.load.image(Building.SAVE.type, 'assets/save.jpg');
    this.load.image(Building.LANDMARK.type, 'assets/landmark.jpg');
    this.load.image(Building.MUSEUM.type, 'assets/museum.jpg');

    this.load.image('back', 'assets/back.png');
    this.load.image('world', 'assets/world.png');

    preloadUiElements(this);
}

function create() {
    // create empty map tiles
    createMap(this);

    this.buildings = new TerritoryUI(this);
    this.add.existing(this.buildings);

    // attach event listeners
    attachListeners(this);

    if(this.scene.isActive('info')) {
        this.engine.emit('showInfo', {
            data: territory,
            type: 'territory'
        });
    } else {
        this.engine.on('sceneLoaded', (key) => {
            if(key === 'info') this.engine.emit('showInfo', {
                data: territory,
                type: 'territory'
            });
        });
    }
    this.engine.emit('sceneLoaded', 'territory');

    this.exitButton = new ImageButton(this, CAMERA_WIDTH, GAME_HEIGHT - IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_HEIGHT, 'barrack', '영지 삭제', () => {
        player.deleteTerritory(territory);
        this.scene.start('world', {
            player: player,
            centerX: territory.x,
            centerY: territory.y
        });
    }, null, 'purple_button');
    this.add.existing(this.exitButton);

}

function update(up, delta) {
    updateEnoughMoney();
    updatePlacable();
    territory._updateAttributes();
}

function createMap(scene) {
    map = scene.add.group();
    for(var y=0; y<mapHeight; y++) {
        for (var x = 0; x < mapWidth; x++) {
            let grass = createNewMapChild('grass', x * IMAGE_WIDTH, IMAGE_HEIGHT + y * IMAGE_HEIGHT, x, y)
                .setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 100), Phaser.Geom.Rectangle.Contains);
            if(territory.map[y][x] !== 'grass')
                grass.over = createNewMapChild(territory.map[y][x], x * IMAGE_WIDTH, IMAGE_HEIGHT + y * IMAGE_HEIGHT, x, y);
        }
    }
}

function attachListeners(scene) {
    scene.input.on('gameobjectover', hoverListener, scene);
    scene.input.on('gameobjectout', outListener, scene);
    scene.input.on('pointerdown', confirmEditing, scene);
}

function hoverListener(pointer, gameObject) {
    if(gameObject.layer !== 'map') {
        edit.over = null;
        return;
    }
    moveEditing(gameObject);
}

function outListener(pointer, gameObject) {
}

/* ===== 건물 배치 관련 함수 ===== */

function moveEditing(gameObject) {
    edit.over = gameObject;
    if(!edit.object) return;
    edit.object.setPosition(gameObject.x, gameObject.y);
    edit.object.mapX = gameObject.mapX;
    edit.object.mapY = gameObject.mapY;
}

function confirmEditing() {
    if(!edit.object) return;
    if(!edit.placable) return;
    if(!edit.over) return;
    if(edit.isRemoving) {
        territory.remove(edit.object.mapX, edit.object.mapY, this.engine);
    }
    territory.build(edit.object.mapX, edit.object.mapY, edit.object.type, this.engine);
    edit.object.setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 100), Phaser.Geom.Rectangle.Contains);
    edit.object.setAlpha(1);

    territory._player.deltaMoney(-edit.cost);

    edit.over.destroy();
    edit.object = null;
}

function startEditing(buildingType, cost) {
    cancelEditing();

    edit.isRemoving = false;
    if(edit.over) {
        edit.object = createNewMapChild(buildingType, edit.over.x, edit.over.y);
        if(edit.over.type !== 'grass') edit.object.setTint(0xff0000);
    } else edit.object = createNewMapChild(buildingType, 0, IMAGE_HEIGHT);
    edit.cost = cost;
    edit.object.setAlpha(1);
}

function updateEnoughMoney() {
    if(!edit.object) return;
    edit.enoughMoney = territory._player.money >= edit.cost;
}

function updatePlacable() {
    if(!edit.object) return;

    if(edit.isRemoving) {

    } else {
        // 만약 아래에 아무것도 없거나(맵 밖) 이미 건물이 지어진 곳이라면 못지음
        if(!edit.over || edit.over.over) {
            edit.object.setTint(0xff0000);
            edit.placable = false;
            return;
        }

        if(!edit.enoughMoney) {
            edit.object.setTint(0xff0000);
            edit.placable = false;
            return;
        }
    }

    edit.object.clearTint();
    edit.placable = true;
}

function cancelEditing() {
    if(!edit.object) return;
    edit.object.destroy();
    edit.object = null;
}

function startRemoving() {
    cancelEditing();
    edit.isRemoving = true;
    if(edit.over) {
        edit.object = createNewMapChild('grass', edit.over.x, edit.over.y);
    } else edit.object = createNewMapChild('grass');
    edit.object.setAlpha(0.5);
    edit.cost = 0;
}

function createNewMapChild(type, x, y, mx, my) {
    x = typeof x !== 'undefined'? x : 0;
    y = typeof y !== 'undefined'? y : 0;
    var e = map.create(x, y, type);
    e.setOrigin(0, 0);
    e.type = type;
    e.layer = 'map';
    e.mapX = mx;
    e.mapY = my;
    return e;
}
