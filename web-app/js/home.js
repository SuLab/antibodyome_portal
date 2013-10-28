if($.cookie()['username']!='null' && $.cookie()['username']!=undefined) {
    username = $.cookie()['username'];
    var login_html = '<span class="logout"><a href="#">'+username+'</a>  <a href="/registration/accounts/logout/">logout</a></span>';
    $('#user-login').after(login_html);
    $('#user-login').addClass('hide');
}
else {
    $('#user-login').removeClass('hide');
}

$('#user-login').click(function() {
    $('#my-login-modal').modal();
    $('#login-button').click(function(){
        var username = $('#username').val();
        var password = $('#password').val();
        if(username==''|| password=='') {
            if(!$('#error-login').hasClass('hide')) {
                $('#error-login').addClass('hide');
            }
            $('#blank-login').removeClass('hide');
        }
        else {
            $.post('/registration/login/',
                {
                    username: username,
                    password: password
                },
                function(res){
                    if(res.status=='1') {
                        $('#my-login-modal').modal('hide');
                        var login_html = '<span class="logout"><a href="#">'+username+'</a>  <a href="/registration/accounts/logout/">logout</a></span>';
                        $('#user-login').after(login_html);
                        $('#user-login').addClass('hide');

                    }
                    else {
                        if(!$('#blank-login').hasClass('hide')) {
                            $('#blank-login').addClass('hide');
                        }
                        $('#error-login').removeClass('hide');
                    }
                }
            )
        }
    });
});
