class TerritoryUI extends Phaser.GameObjects.GameObject {
    constructor(scene) {
        super(scene);

        let menu = new List(scene, mapWidth * IMAGE_WIDTH, 0,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        let buildings = this._createBuildingLists(scene, menu);
        menu.addChild(new ImageButton(scene, 0, 0, 100, 100, 'world', '월드맵', function() {
            scene.scene.start('world', {
                player: player,
                centerX: territory.x,
                centerY: territory.y
            });
        }));
        menu.addChild(new ImageButton(scene, 0, 0, 100, 100, 'menu_build', '건축', function() {
            menu.close();
            buildings.main.open();
        }));
        menu.addChild(new ImageButton(scene, 0, 0, 100, 100, 'menu_remove_build', '건물 삭제', function() {
            startRemoving();
        }));
    }

    _createBuildingLists(scene, menu) {
        let buildings = {
            main: null,
            population: null,
            food: null,
            army: null,
            extra: null
        };

        // 인구 관련 건물
        buildings.population = new List(scene, mapWidth * IMAGE_WIDTH, 0,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        buildings. population.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            'back', '뒤로', () => {
                cancelEditing();
                buildings.population.close();
                buildings.main.open();
            }));
        buildings.population.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            Building.HOUSE.type, '집', () => {
                startEditing(Building.HOUSE.type, Building.HOUSE.cost);
            }));
        buildings.population.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            Building.LANDMARK.type, '랜드마크', () => {
                startEditing(Building.LANDMARK.type, Building.LANDMARK.cost);
            }));
        buildings.population.close();

        // 식량 관련 건물
        buildings.food = new List(scene, mapWidth * IMAGE_WIDTH, 0,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        buildings.food.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            'back', '뒤로', () => {
                cancelEditing();
                buildings.food.close();
                buildings.main.open();
            }));
        buildings.food.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            Building.PRODUCT.type, '생산소', () => {
                startEditing(Building.PRODUCT.type, Building.PRODUCT.cost);
            }));
        buildings.food.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            Building.SAVE.type, '저장고', () => {
                startEditing(Building.SAVE.type, Building.SAVE.cost);
            }));
        buildings.food.close();

        // 병력 관련 건물
        buildings.army = new List(scene, mapWidth * IMAGE_WIDTH, 0,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        buildings.army.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            'back', '뒤로', () => {
                cancelEditing();
                buildings.army.close();
                buildings.main.open();
            }));
        buildings.army.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            Building.BARRACK.type, '병영', () => {
                startEditing(Building.BARRACK.type, Building.BARRACK.cost);
            }));
        buildings.army.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            Building.POST.type, '주둔지', () => {
                startEditing(Building.POST.type, Building.POST.cost);
            }));
        buildings.army.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            Building.TRAIN.type, '훈련장', () => {
                startEditing(Building.TRAIN.type, Building.TRAIN.cost);
            }));
        buildings.army.close();

        // 기타 건물
        buildings.extra = new List(scene, mapWidth * IMAGE_WIDTH, 0,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        buildings.extra.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            'back', '뒤로', () => {
                cancelEditing();
                buildings.extra.close();
                buildings.main.open();
            }));
        buildings.extra.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            Building.MUSEUM.type, '전시장', () => {
                startEditing(Building.MUSEUM.type, Building.MUSEUM.cost);
            }));
        buildings.extra.close();


        buildings.main = new List(scene, mapWidth * IMAGE_WIDTH, 0,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        buildings.main.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            'back', '뒤로', () => {
                cancelEditing();
                buildings.main.close();
                menu.open();
            }));
        buildings.main.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            'menu_population', '인구', () => {
                buildings.main.close();
                buildings.population.open();
            }));
        buildings.main.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            'menu_food', '식량', () => {
                buildings.main.close();
                buildings.food.open();
                buildings.food.open();
            }));
        buildings.main.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
            'menu_army', '병력', () => {
                buildings.main.close();
                buildings.army.open();
            }));
        buildings.main.close();

        return buildings;
    }

}