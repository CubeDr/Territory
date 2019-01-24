var IMAGE_WIDTH = 100;
var IMAGE_HEIGHT = 100;

const DEFAULT_MONEY_INCREASE_FACTOR = 1.75;
const DEFAULT_FOOD_DECREASE_FACTOR = 2;
const ARMY_MONEY_DECREASE_FACTOR = 2;
const ARMY_FOOD_DECREASE_FACTOR = 2.5;
const DEFAULT_ARMY_TRANSFER_FACTOR = 0.25; // 4 초에 1 명씩 전환
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

var Building = {
    BARRACK: {
        type: 'barrack',
        name: '병영',
        cost: 1000,
        cost_increment: 500,
        maintain: 30
    },
    POST: {
        type: 'post',
        name: '주둔지',
        cost: 1000,
        cost_increment: 500,
        maintain: 20
    },
    TRAIN: {
        type: 'train',
        name: '훈련장',
        cost: 1000,
        cost_increment: 500,
        maintain: 50
    },
    HOUSE: {
        type: 'house',
        name: '집',
        cost: 100,
        cost_increment: 100,
        maintain: 5
    },
    PRODUCT: {
        type: 'product',
        name: '생산소',
        cost: 200,
        cost_increment: 100,
        maintain: 7
    },
    SAVE: {
        type: 'save',
        name: '저장고',
        cost: 1000,
        cost_increment: 500,
        maintain: 50
    },
    LANDMARK: {
        type: 'landmark',
        name: '랜드마크',
        cost: 1000,
        cost_increment: 500,
        maintain: 18
    },
    MUSEUM: {
        type: 'museum',
        name: '전시장',
        cost: 1000,
        cost_increment: 500,
        maintain: 50
    }
};