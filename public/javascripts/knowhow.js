function calculateKnowhowPopulationMax(buildings) {
    let count = 0;
    for(let y=0; y<buildings.length; y++) {
        for(let x=0; x<buildings[y].length; x++) {
            if(buildings[y][x] == null) continue;
            switch(buildings[y][x].knowhow) {
                case 1:
                    count += countNearby(buildings, x, y, Building.HOUSE.ID);
                    break;
                default:
                    break;
            }
        }
    }
    return count;
}

function countNearby(buildings, x, y, type, dist=1) {
    let count = 0;
    for(let Y = y-dist; Y <= y + dist; Y++) {
        for(let X = x-dist; X <= x + dist; X++) {
            if(buildings[Y][X] == null) continue;
            if(X === x && Y === y) continue;
            if(buildings[Y][X].type === type) count++;
        }
    }
    return count;
}