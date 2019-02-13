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
    "grass", "house", "landmark", "product", "save", "barrack", "post", "train"
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

    // load menu items
    this.load.image('menu_build', 'assets/menu/menu_build.png');
    this.load.image('menu_remove_build', 'assets/menu/menu_remove_build.png');
    this.load.image('menu_population', 'assets/menu/menu_population.png');
    this.load.image('menu_food', 'assets/menu/menu_food.png');
    this.load.image('menu_army', 'assets/menu/menu_army.png');
    this.load.image('menu_barrack', 'assets/menu/menu_barrack.png');
    this.load.image('menu_house', 'assets/menu/menu_house.png');
    this.load.image('menu_landmark', 'assets/menu/menu_landmark.png');
    this.load.image('menu_post', 'assets/menu/menu_post.png');
    this.load.image('menu_product', 'assets/menu/menu_product.png');
    this.load.image('menu_save', 'assets/menu/menu_save.png');
    this.load.image('menu_train', 'assets/menu/menu_train.png');
    this.load.image('menu_remove_territory', 'assets/menu/menu_remove_territory.png');

    this.load.image('back', 'assets/menu_back.png');
    this.load.image('world', 'assets/tile_world.png');
    this.load.image('background_dialog', 'assets/background_dialog.png');

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

    this.exitButton = new ImageButton(this, CAMERA_WIDTH, GAME_HEIGHT - IMAGE_HEIGHT, IMAGE_WIDTH, IMAGE_HEIGHT,
        'menu_remove_territory', '영지 삭제', () => {
        postRemoveTerritory(
            JSON.stringify({'idTokenString': gameEngine.idToken, 'territoryId': territory.id}),
            (result) => {
                if (result === 0) {
                    gameEngine.player.deleteTerritory(territory);
                    territoryScene.scene.start('world', {
                        player: gameEngine.player,
                        centerX: territory.x,
                        centerY: territory.y
                    });
                    gameEngine.uploadUser();
                } else console.log(result);
            });
    }, null, 'purple_button');
    this.add.existing(this.exitButton);

    this.buildingInfoDialog = buildBuildingInfoDialog();
}

function update(up, delta) {
    updateEnoughMoney();
    updatePlacable();
    territory._updateAttributes();
}

function buildBuildingInfoDialog() {
    let d = territoryScene.add.container(100, 200);

    d.background = territoryScene.add.nineslice(
        0, 0, 200, 200, 'background_dialog', 30, 10
    );
    d.add(d.background);
    d.background.setInteractive();

    // name
    d.name = territoryScene.add.text(10, 10, '집', { fontSize: 20 });
    d.add(d.name);

    // maintain
    d.add(territoryScene.add.text(10, 40, '유지비', { fontSize: 15 }));
    d.add(territoryScene.add.image(60, 40, 'coin').setScale(0.5).setOrigin(0));
    d.maintain = territoryScene.add.text(77, 40, '100', { fontSize: 15 });
    d.add(d.maintain);

    // knowhow
    d.add(territoryScene.add.text(10, 65, '노하우', { fontSize: 15 }));
    d.knowhow = territoryScene.add.text(10, 83, '적용된 노하우 없음', { fontSize: 13 });
    d.add(d.knowhow);

    // close button
    d.button = new TextButton(territoryScene, 100, 195, '확인', { onClick: ()=>{
        d.show();
    }}).setOrigin(0.5, 1);
    territoryScene.add.existing(d.button);
    d.add(d.button);

    d.show = () => {
        // d.background.resize(200, 120);
        // d.button.setPosition(100, 115);
    };

    return d;
}

function createMap(scene) {
    map = scene.add.group();
    for(var y=0; y<mapHeight; y++) {
        for (var x = 0; x < mapWidth; x++) {
            let grass = createNewMapChild('grass', x * IMAGE_WIDTH, IMAGE_HEIGHT + y * IMAGE_HEIGHT, x, y, true)
                .setInteractive(new Phaser.Geom.Rectangle(0, 0, 100, 100), Phaser.Geom.Rectangle.Contains);
            if(territory.map[y][x] !== 'grass')
                grass.over = createNewMapChild(territory.map[y][x], x * IMAGE_WIDTH, IMAGE_HEIGHT + y * IMAGE_HEIGHT, x, y, true);
        }
    }
}

function attachListeners(scene) {
    scene.input.on('gameobjectover', hoverListener, scene);
    scene.input.on('gameobjectout', outListener, scene);
    scene.input.on('pointerdown', confirmEditing, scene);
    scene.input.on('gameobjectup', click, scene);
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

    // 삭제하려는 건물이 없는 경우
    if(edit.isRemoving && !edit.over.over) return;

    // 건물 삭제 요청이면 type을 -1로 요청
    let data = {
        idTokenString: gameEngine.idToken,
        territoryId: territory.id,
        x: edit.object.mapX,
        y: edit.object.mapY,
        type: edit.isRemoving? -1 : BUILDING_ID[edit.object.type]
    };

    postBuild(JSON.stringify(data),
        function(id) {
            if(data.type === -1) {
                // 삭제 요청 성공
                territory.remove(data.x, data.y, gameEngine);

                // 원래 있던 건물 제거
                edit.over.over.destroy();
                edit.over.over = null;
                // 제거 효과 표시 제거
                edit.object.destroy();
            } else {
                // 건축 요청 성공
                territory.build(id, data.x, data.y, BUILDING_TYPE[data.type], gameEngine);

                // 애니메이션 제거
                edit.tween.stop();
                edit.tween = null;
                edit.object.setScale(1);

                edit.over.over = edit.object;
                edit.object.setOrigin(0);
                edit.object.setPosition(edit.over.x, edit.over.y);
            }

            territory._player.deltaMoney(-edit.cost);
            edit.object = null;

            gameEngine.uploadUser();
        }
    );
}

function startEditing(buildingType, cost) {
    cancelEditing();

    edit.isRemoving = false;
    if(edit.over) {
        edit.object = createNewMapChild(buildingType, edit.over.x + IMAGE_WIDTH/2, edit.over.y + IMAGE_HEIGHT/2);
        if(edit.over.type !== 'grass') edit.object.setTint(0xff0000);
    } else {
        let pos = firstPosition(true);
        edit.object = createNewMapChild(buildingType,
            pos.x + IMAGE_WIDTH/2,
            pos.y + IMAGE_HEIGHT/2);
    }
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
    } else {
        let pos = firstPosition(false);
        edit.object = createNewMapChild('grass',
            pos.x, pos.y);
    }
    edit.object.setAlpha(0.5);
    edit.cost = 0;
}

function click(p, go) {
    if(go.type !== 'grass') return;
    if(go.over == null) return;

    let building = go.over;
    console.log(building);
}

function createNewMapChild(type, x, y, mx, my, randomStart=false) {
    x = typeof x !== 'undefined'? x : 0;
    y = typeof y !== 'undefined'? y : 0;

    let e = territoryScene.add.sprite(x, y, type + 'Sprite');
    e.anims.load(type + 'Anim');

    if(randomStart) {
        // Randomize animation
        e.anims.setDelay(randInt(0, 200));
        e.anims.setProgress(randInt(0, 2));
    }
    e.anims.play(type + 'Anim');

    map.add(e);

    e.setOrigin(0, 0);
    e.type = type;
    e.layer = 'map';
    e.mapX = mx;
    e.mapY = my;
    return e;
}

function firstPosition(empty) {
    let firstPosition = null;
    map.getChildren().forEach((c) => {
        if(firstPosition != null) return;
        if(empty) {
            if(c.type === 'grass' && c.over == null) firstPosition = {
                x: c.x, y: c.y
            };
        } else {
            if(c.type !== 'grass') firstPosition = {
                x: c.x, y: c.y
            };
        }

    });
    if(firstPosition == null) firstPosition = {
        x: 0, y: 0
    };
    return firstPosition;
}