function start() {
    gapi.load('auth2', function() {
        auth2 = gapi.auth2.init({
            client_id: '186418311604-bdsvh2mclm99blqp1l3k1kgfoddl8e32.apps.googleusercontent.com'
        });
    });
}

function signInCallback(authResult) {
    if (authResult['code']) {

        // Send sign in request to server
        doAjax(
            'POST',
            'signin',
            authResult['code'],
            function(result) {
                if(result !== "") {
                    // signed in
                    $('#signinButton').attr('style', 'display: none');
                    gameEngine.emit('sign in', {
                        idToken: gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token,
                        playerData: JSON.parse(result)
                    });
                } else {
                    // error
                    alert("로그인 오류가 발생했습니다. code:" + result)
                }
            }
        );
    } else {
        // There was an error.
    }
}

let b64DecodeUnicode = str =>
    decodeURIComponent(
        Array.prototype.map.call(atob(str), c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));

let parseJwt = token =>
    JSON.parse(
        b64DecodeUnicode(
            token.split('.')[1].replace('-', '+').replace('_', '/')
        )
    );