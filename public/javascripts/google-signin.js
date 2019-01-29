function start() {
    gapi.load('auth2', function() {
        auth2 = gapi.auth2.init({
            client_id: '993243426184-u63g9etnmb53b6vbf282li6a9rcrjrok.apps.googleusercontent.com'
        });
    });
}

function signInCallback(authResult) {
    if (authResult['code']) {

        // Hide the sign-in button now that the user is authorized, for example:
        $('#signinButton').attr('style', 'display: none');

        // TODO Send the code to the server
        // $.ajax({
        //     // type: 'POST',
        //     // url: 'http://example.com/storeauthcode',
        //     // // Always include an `X-Requested-With` header in every AJAX request,
        //     // // to protect against CSRF attacks.
        //     // headers: {
        //     //     'X-Requested-With': 'XMLHttpRequest'
        //     // },
        //     // contentType: 'application/octet-stream; charset=utf-8',
        //     // success: function(result) {
        //     //     // Handle or verify the server response.
        //     // },
        //     // processData: false,
        //     // data: authResult['code']
        // });
    } else {
        // There was an error.
    }
}