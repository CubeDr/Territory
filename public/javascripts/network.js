function postUserResource(data, success) {
    doAjax('POST', "player/set", data, success);
}

function postBuild(data, success) {
    doAjax('POST','territory/build', data, success);
}

function postRemoveTerritory(data, success) {
    doAjax('POST', 'territory/destroy', data, success);
}

function postExploitTerritory(data, success) {
    doAjax('POST', 'territory/exploit', data, success);
}

function postTerritoryResource(data, success) {
    doAjax('POST', 'territory/set', data, success);
}

function postLearn(data, success) {
    doAjax('POST', 'player/learn', data, success);
}

function postBuildingKnowhow(data, success) {
    doAjax('POST', 'building/knowhow', data, success);
}

function getPlayerList(success) {
    doAjax('GET', 'player/list',
        "idTokenString=" + gameEngine.idToken, success);
}