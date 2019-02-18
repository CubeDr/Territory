class TerritoryUI extends Phaser.GameObjects.GameObject {
    constructor(scene) {
        super(scene);

        let menu = new List(scene, mapWidth * IMAGE_WIDTH, IMAGE_HEIGHT,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        let buildings = this._createBuildingLists(scene, menu);
        menu.addChild(new _MenuButton(scene, 'world', '월드맵',
            function() {
            scene.scene.start('world', {
                centerX: territory.x,
                centerY: territory.y
            });
        }));
        menu.addChild(new _MenuButton(scene, 'menu_build', '건축',
            function() {
            menu.close();
            buildings.main.open();
        }));
        menu.addChild(new _MenuButton(scene, 'menu_fight', '침략',
            function() {
            console.log("침략");
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
        buildings.population = new List(scene, mapWidth * IMAGE_WIDTH, IMAGE_HEIGHT,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        buildings. population.addChild(new _MenuButton(scene, 'back', '뒤로',
            () => {
                cancelEditing();
                buildings.population.close();
                buildings.main.open();
            }));
        buildings.population.addChild(new _MenuButton(scene, 'menu_' + Building.HOUSE.type, '집',
            () => {
                startEditing(Building.HOUSE.type, Building.HOUSE.cost);
            }, Building.HOUSE));
        buildings.population.addChild(new _MenuButton(scene, 'menu_' + Building.LANDMARK.type, '랜드마크',
            () => {
                startEditing(Building.LANDMARK.type, Building.LANDMARK.cost);
            }, Building.LANDMARK));
        buildings.population.close();

        // 식량 관련 건물
        buildings.food = new List(scene, mapWidth * IMAGE_WIDTH, IMAGE_HEIGHT,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        buildings.food.addChild(new _MenuButton(scene, 'back', '뒤로',
            () => {
                cancelEditing();
                buildings.food.close();
                buildings.main.open();
            }));
        buildings.food.addChild(new _MenuButton(scene, 'menu_' + Building.PRODUCT.type, '생산소',
            () => {
                startEditing(Building.PRODUCT.type, Building.PRODUCT.cost);
            }, Building.PRODUCT));
        buildings.food.addChild(new _MenuButton(scene, 'menu_' + Building.SAVE.type, '저장고',
            () => {
                startEditing(Building.SAVE.type, Building.SAVE.cost);
            }, Building.SAVE));
        buildings.food.close();

        // 병력 관련 건물
        buildings.army = new List(scene, mapWidth * IMAGE_WIDTH, IMAGE_HEIGHT,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        buildings.army.addChild(new _MenuButton(scene, 'back', '뒤로',
            () => {
                cancelEditing();
                buildings.army.close();
                buildings.main.open();
            }));
        buildings.army.addChild(new _MenuButton(scene, 'menu_' + Building.BARRACK.type, '병영',
            () => {
                startEditing(Building.BARRACK.type, Building.BARRACK.cost);
            }, Building.BARRACK));
        buildings.army.addChild(new _MenuButton(scene, 'menu_' + Building.POST.type, '주둔지',
            () => {
                startEditing(Building.POST.type, Building.POST.cost);
            }, Building.POST));
        buildings.army.addChild(new _MenuButton(scene, 'menu_' + Building.TRAIN.type, '훈련장',
            () => {
                startEditing(Building.TRAIN.type, Building.TRAIN.cost);
            }, Building.TRAIN));
        buildings.army.close();

        // 기타 건물
        // buildings.extra = new List(scene, mapWidth * IMAGE_WIDTH, 0,
        //     IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
        //     'vertical', 10);
        // buildings.extra.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        //     'back', '뒤로', () => {
        //         cancelEditing();
        //         buildings.extra.close();
        //         buildings.main.open();
        //     }));
        // buildings.extra.addChild(new ImageButton(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT,
        //     Building.MUSEUM.type, '전시장', () => {
        //         startEditing(Building.MUSEUM.type, Building.MUSEUM.cost);
        //     }));
        // buildings.extra.close();


        buildings.main = new List(scene, mapWidth * IMAGE_WIDTH, IMAGE_HEIGHT,
            IMAGE_WIDTH, IMAGE_HEIGHT * mapHeight,
            'vertical', 10);
        buildings.main.addChild(new _MenuButton(scene,
            'back', '뒤로',
            () => {
                cancelEditing();
                buildings.main.close();
                menu.open();
            }));
        buildings.main.addChild(new _MenuButton(scene,
            'menu_population', '인구',
            () => {
                buildings.main.close();
                buildings.population.open();
            }));
        buildings.main.addChild(new _MenuButton(scene,
            'menu_food', '식량',
            () => {
                buildings.main.close();
                buildings.food.open();
                buildings.food.open();
            }));
        buildings.main.addChild(new _MenuButton(scene,
            'menu_army', '병력',
            () => {
                buildings.main.close();
                buildings.army.open();
            }));
        buildings.main.addChild(new _MenuButton(scene,
            'menu_remove_build', '건물 삭제',
            () => {
            startRemoving();
        }));
        buildings.main.close();

        return buildings;
    }

}

class _MenuButton extends ImageButton {
    constructor(scene, imageKey, title, onClick, hoverData) {
        super(scene, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT, imageKey, title, onClick, null, 'button');
        if(hoverData) {
            let dialog = this.buildDialog(scene, hoverData);

            this.onHover = () => {
                dialog.setPosition(CAMERA_WIDTH, this.y + this.height/2 + IMAGE_HEIGHT);
                dialog.visible = true;
            };

            this.onOut = () => {
                dialog.visible = false;
            };
        }
    }

    buildDialog(scene, data) {
        let d = scene.add.container();

        let left = -280;
        let top = -67;

        let back = scene.add.nineslice(
            0, 0, 300, 135, 'background_dialog', 30, 10
        ).setOrigin(1, 0.5);
        d.add(back);

        let title = scene.add.text(left, top + 20, data.name, { fontSize: 20 });
        d.add(title);

        let desc = scene.add.text(left, top + 50, data.description, { fontSize: 13 });
        d.add(desc);

        let buildCostTitle = scene.add.text(left, top + 75, '건축비', { fontSize: 15 });
        d.add(buildCostTitle);

        let buildCostIcon = scene.add.image(left + 50, top + 75, 'coin').setScale(0.5).setOrigin(0);
        d.add(buildCostIcon);

        let buildCostText = scene.add.text(left + 67, top + 75, data.cost, { fontSize: 15 });
        d.add(buildCostText);

        let maintainTitle = scene.add.text(left, top + 98, '유지비', { fontSize: 15 });
        d.add(maintainTitle);

        let maintainIcon = scene.add.image(left + 50, top + 98, 'coin').setScale(0.5).setOrigin(0);
        d.add(maintainIcon);

        let maintainText = scene.add.text(left + 67, top + 98, data.maintain + '/초', { fontSize: 15 });
        d.add(maintainText);

        d.visible = false;
        d.setDepth(1);
        return d;
    }
}