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
var tweens = null;

var territoryScene = null;
const TERRITORY_USING_SPRITE = [
    "grass", "house", "landmark", "product", "save"
];

var edit = {
    object: null,
    over: null,
    cost: 0,
    enoughMoney: false,
    placable: false
};

function init(territoryData) {
    territory = territoryData;
    territoryScene = this;
}

function preload() {
    if(!this.scene.isActive('info'))
        this.scene.launch('info', territory.player);

    this.engine = this.scene.get('engine');

    loadTileSprites(this, TERRITORY_USING_SPRITE);
    this.load.image(Building.BARRACK.type, 'assets/tile_barrack.jpg');
    this.load.image(Building.POST.type, 'assets/tile_post.png');
    this.load.image(Building.TRAIN.type, 'assets/tile_train.jpg');
    this.load.image(Building.PRODUCT.type, 'assets/tile_product.jpg');
    this.load.image(Building.SAVE.type, 'assets/tile_save.jpg');
    this.load.image(Building.LANDMARK.type, 'assets/tile_landmark.jpg');
    this.load.image(Building.MUSEUM.type, 'assets/tile_museum.jpg');

    this.load.image('back', 'assets/menu_back.png');
    this.load.image('world', 'assets/tile_world.png');

    preloadUiElements(this);
}

function create() {
    createAnimations(this, TERRITORY_USING_SPRITE);

    tweens = this.tweens;

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
    if(edit.isRemoving) {
        edit.object.setPosition(gameObject.x, gameObject.y);
    } else {
        edit.object.setPosition(gameObject.x + IMAGE_WIDTH/2, gameObject.y + IMAGE_HEIGHT/2);
    }
    edit.object.mapX = gameObject.mapX;
    edit.object.mapY = gameObject.mapY;
}

function confirmEditing() {
    if(!edit.object) return;
    if(!edit.placable) return;
    if(!edit.over) return;
    if(edit.isRemoving) {
        territory.remove(edit.object.mapX, edit.object.mapY, this.engine);

        // 원래 있던 건물 제거
        edit.over.over.destroy();
        // 제거 효과 표시 제거
        edit.object.destroy();
    } else {
        // 애니메이션 제거
        edit.tween.stop();
        edit.tween = null;
        edit.object.setScale(1);

        // 풀 위에 건물 짓기
        territory.build(edit.object.mapX, edit.object.mapY, edit.object.type, this.engine);
        edit.over.over = edit.object;
        edit.object.setOrigin(0);
        edit.object.setPosition(edit.over.x, edit.over.y);
    }

    territory._player.deltaMoney(-edit.cost);

    edit.object = null;
}

function startEditing(buildingType, cost) {
    cancelEditing();

    edit.isRemoving = false;
    if(edit.over) {
        edit.object = createNewMapChild(buildingType, edit.over.x + IMAGE_WIDTH/2, edit.over.y + IMAGE_HEIGHT/2);
        if(edit.over.type !== 'grass') edit.object.setTint(0xff0000);
    } else edit.object = createNewMapChild(buildingType, 0, IMAGE_HEIGHT);
    edit.cost = cost;
    edit.object.setAlpha(1);

    edit.object.setOrigin(0.5);
    edit.tween = tweens.add({
        targets: edit.object,
        scaleX: 0.8,
        scaleY: 0.8,
        yoyo: true,
        repeat: -1
    });
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

    let e = null;
    switch(type) {
        case 'grass': case 'house': case 'landmark': case 'product': case 'save':
            e = territoryScene.add.sprite(x, y, type + 'Sprite');
            e.anims.load(type + 'Anim');
            e.anims.play(type + 'Anim');
            map.add(e);
            break;
        default:
            e = map.create(x, y, type);
            break;
    }
    e.setOrigin(0, 0);
    e.type = type;
    e.layer = 'map';
    e.mapX = mx;
    e.mapY = my;
    return e;
}
