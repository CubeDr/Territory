function start() {
    gapi.load('auth2', function() {
        auth2 = gapi.auth2.init({
            client_id: '993243426184-bb0hq9ud0dtb5qi7kikvenjivv8c1vnv.apps.googleusercontent.com'
        });
    });
}

function signInCallback(authResult) {
    if (authResult['code']) {

        // Hide the sign-in button now that the user is authorized, for example:
        $('#signinButton').attr('style', 'display: none');

        console.log(parseJwt(gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token));
        $.ajax({
            type: 'POST',
            url: 'https://localhost:8080/storeauthcode',
            // Always include an `X-Requested-With` header in every AJAX request,
            // to protect against CSRF attacks.
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            contentType: 'application/octet-stream; charset=utf-8',
            success: function(result) {
                // Handle or verify the server response.
                console.log(result);
            },
            processData: false,
            data: authResult['code']
        });
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