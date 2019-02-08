var IMAGE_WIDTH = 100;
var IMAGE_HEIGHT = 100;

const DEFAULT_POPULATION_INCREASE_FACTOR = 0.25;
const DEFAULT_MONEY_INCREASE_FACTOR = 1.75;
const DEFAULT_FOOD_DECREASE_FACTOR = 2;
const ARMY_MONEY_DECREASE_FACTOR = 2;
const ARMY_FOOD_DECREASE_FACTOR = 2.5;
const DEFAULT_ARMY_TRANSFER_CYCLE = 4000; // 4 초에 1 명씩 전환
const DEFAULT_ARMY_NEW_QUALITY = 70;

const FIGHT_ARMY_MONEY = 40;
const FIGHT_ARMY_FOOD = 8;
const FIGHT_REWARD_MONEY = 100;
const FIGHT_REWARD_FOOD = 20;
const FIGHT_MOVEMENT_SPEED = 100/3; // 33.33m/s

const GAME_WIDTH = 900;
const GAME_HEIGHT = 900;
const CAMERA_WIDTH = 800;
const CAMERA_HEIGHT = 800;
const WORLD_WIDTH = 51;
const WORLD_HEIGHT = 51;

const UPDATE_CYCLE = 50; // ms
const UPLOAD_CYCLE = 10000; // 10s

var Building = {
    BARRACK: {
        ID: 4,
        type: 'barrack',
        name: '병영',
        cost: 1000,
        cost_increment: 500,
        maintain: 30
    },
    POST: {
        ID: 5,
        type: 'post',
        name: '주둔지',
        cost: 1000,
        cost_increment: 500,
        maintain: 20
    },
    TRAIN: {
        ID: 6,
        type: 'train',
        name: '훈련장',
        cost: 1000,
        cost_increment: 500,
        maintain: 50
    },
    HOUSE: {
        ID: 0,
        type: 'house',
        name: '집',
        cost: 10,
        cost_increment: 100,
        maintain: 5
    },
    PRODUCT: {
        ID: 2,
        type: 'product',
        name: '생산소',
        cost: 200,
        cost_increment: 100,
        maintain: 7
    },
    SAVE: {
        ID: 3,
        type: 'save',
        name: '저장고',
        cost: 1000,
        cost_increment: 500,
        maintain: 50
    },
    LANDMARK: {
        ID: 1,
        type: 'landmark',
        name: '랜드마크',
        cost: 1000,
        cost_increment: 500,
        maintain: 18
    },
    MUSEUM: {
        ID: 7,
        type: 'museum',
        name: '전시장',
        cost: 1000,
        cost_increment: 500,
        maintain: 50
    }
};
const BUILDING_TYPE = [
    Building.HOUSE.type,
    Building.LANDMARK.type,
    Building.PRODUCT.type,
    Building.SAVE.type,
    Building.BARRACK.type,
    Building.POST.type,
    Building.TRAIN.type,
    Building.MUSEUM.type
];

const BUILDING_ID = {
    "house": 0,
    "landmark": 1,
    "product": 2,
    "save": 3,
    "barrack": 4,
    "post": 5,
    "train": 6,
    "musuem": 7
};