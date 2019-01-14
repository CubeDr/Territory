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

var ui = {
    resources: null,
    menu: null,
    buildings: {
        main: null,
        population: null,
        food: null,
        army: null,
        extra: null
    }
};

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
    this.load.image('grass', 'assets/grass.jpg');
    this.load.image(Building.BARRACK.type, 'assets/barrack.jpg');
    this.load.image(Building.POST.type, 'assets/post.png');
    this.load.image(Building.TRAIN.type, 'assets/train.jpg');
    this.load.image(Building.HOUSE.type, 'assets/house.jpg');
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
    createUi(this);

    // attach event listeners
    attachListeners(this);
}

function update(up, delta) {
    updateEnoughMoney();
    updatePlacable();
    this.scene.get('info').showTerritory(territory);
    territory._updateAttributes();
}

function createMap(scene) {
    map = scene.add.group();
    for(var y=0; y<mapHeight; y++) {
        for (var x = 0; x < mapWidth; x++) {
            createNewMapChild(territory.map[y][x], x * IMAGE_WIDTH, IMAGE_HEIGHT + y * IMAGE_HEIGHT, x, y)
                .setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 100), Phaser.Geom.Rectangle.Contains);
        }
    }
}

function createUi(scene) {

    createBuildingList(scene);

    ui.menu = new List(scene, mapWidth * IMAGE_WIDTH, 0,
        IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
        'vertical', 10);
    ui.menu.addChild(new ImageButton(scene, 0, 0, 100, 100, 'world', '월드맵', function() {
        scene.scene.start('world', player);
    }));
    ui.menu.addChild(new ImageButton(scene, 0, 0, 100, 100, 'grass', '건축', function() {
        ui.menu.close();
        ui.buildings.main.open();
    }));
}

function createBuildingList(scene) {
    // 인구 관련 건물
    ui.buildings.population = new List(scene, mapWidth * IMAGE_WIDTH, 0,
        IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
        'vertical', 10);
    ui.buildings. population.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        'back', '뒤로', () => {
            cancelEditing();
            ui.buildings.population.close();
            ui.buildings.main.open();
        }));
    ui.buildings.population.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.HOUSE.type, '집', () => {
            startEditing(Building.HOUSE.type, Building.HOUSE.cost);
        }));
    ui.buildings.population.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.LANDMARK.type, '랜드마크', () => {
            startEditing(Building.LANDMARK.type, Building.LANDMARK.cost);
        }));
    ui.buildings.population.close();

    // 식량 관련 건물
    ui.buildings.food = new List(scene, mapWidth * IMAGE_WIDTH, 0,
        IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
        'vertical', 10);
    ui.buildings.food.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        'back', '뒤로', () => {
            cancelEditing();
            ui.buildings.food.close();
            ui.buildings.main.open();
        }));
    ui.buildings.food.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.PRODUCT.type, '생산소', () => {
            startEditing(Building.PRODUCT.type, Building.PRODUCT.cost);
        }));
    ui.buildings.food.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.SAVE.type, '저장고', () => {
            startEditing(Building.SAVE.type, Building.SAVE.cost);
        }));
    ui.buildings.food.close();

    // 병력 관련 건물
    ui.buildings.army = new List(scene, mapWidth * IMAGE_WIDTH, 0,
        IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
        'vertical', 10);
    ui.buildings.army.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        'back', '뒤로', () => {
            cancelEditing();
            ui.buildings.army.close();
            ui.buildings.main.open();
        }));
    ui.buildings.army.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.BARRACK.type, '병영', () => {
            startEditing(Building.BARRACK.type, Building.BARRACK.cost);
        }));
    ui.buildings.army.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.POST.type, '주둔지', () => {
            startEditing(Building.POST.type, Building.POST.cost);
        }));
    ui.buildings.army.close();

    // 기타 건물
    ui.buildings.extra = new List(scene, mapWidth * IMAGE_WIDTH, 0,
        IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
        'vertical', 10);
    ui.buildings.extra.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        'back', '뒤로', () => {
            cancelEditing();
            ui.buildings.extra.close();
            ui.buildings.main.open();
        }));
    ui.buildings.extra.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.MUSEUM.type, '전시장', () => {
            startEditing(Building.MUSEUM.type, Building.MUSEUM.cost);
        }));
    ui.buildings.extra.close();


    ui.buildings.main = new List(scene, mapWidth * IMAGE_WIDTH, 0,
        IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
        'vertical', 10);
    ui.buildings.main.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        'back', '뒤로', () => {
        cancelEditing();
            ui.buildings.main.close();
            ui.menu.open();
        }));
    ui.buildings.main.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.HOUSE.type, '인구', () => {
            ui.buildings.main.close();
            ui.buildings.population.open();
        }));
    ui.buildings.main.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.PRODUCT.type, '식량', () => {
            ui.buildings.main.close();
            ui.buildings.food.open();
            ui.buildings.food.open();
        }));
    ui.buildings.main.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.BARRACK.type, '병력', () => {
            ui.buildings.main.close();
            ui.buildings.army.open();
        }));
    ui.buildings.main.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        Building.MUSEUM.type, '기타', () => {
            ui.buildings.main.close();
            ui.buildings.extra.open();
        }));
    ui.buildings.main.close();
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
    territory.build(edit.object.mapX, edit.object.mapY, edit.object.type);
    edit.object.setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 100), Phaser.Geom.Rectangle.Contains);
    territory._player.money -= edit.cost;
    edit.over.destroy();
    edit.object = null;
}

function startEditing(buildingType, cost) {
    cancelEditing();

    if(edit.over) {
        edit.object = createNewMapChild(buildingType, edit.over.x, edit.over.y);
        if(edit.over.type !== 'grass') edit.object.setTint(0xff0000);
    } else edit.object = createNewMapChild(buildingType);
    edit.cost = cost;
}

function updateEnoughMoney() {
    if(!edit.object) return;
    edit.enoughMoney = territory._player.money >= edit.cost;
}

function updatePlacable() {
    if(!edit.object) return;
    if(!edit.over || edit.over.type !== 'grass') {
        edit.object.setTint(0xff0000);
        edit.placable = false;
        return;
    }

    if(!edit.enoughMoney) {
        edit.object.setTint(0xff0000);
        edit.placable = false;
        return;
    }

    edit.object.clearTint();
    edit.placable = true;
}

function cancelEditing() {
    if(!edit.object) return;
    edit.object.destroy();
    edit.object = null;
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
