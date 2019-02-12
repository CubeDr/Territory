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