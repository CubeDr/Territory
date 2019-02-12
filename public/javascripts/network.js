function postUserResource(data, success) {
    doAjax('POST', "player/set", data, success);
}

function postBuild(data, success) {
    doAjax('POST','build', data, success);
}

function postRemoveTerritory(data, success) {
    doAjax('POST', 'destroy', data, success);
}

function postExploitTerritory(data, success) {
    doAjax('POST', 'exploit', data, success);
}