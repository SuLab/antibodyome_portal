if ($.cookie()['username'] != 'null' && $.cookie()['username'] != undefined) {
    username = $.cookie()['username'];
    $('#user-login').addClass('hide');
    if (username.length > 12) {
        $('#userinfo').html('<i class="fa fa-'+$.cookie()['usertype']+' fa-lg">&nbsp;</i>'+username.substring(0, 12) + '...<span class="caret"></span>');
    } else {
        $('#userinfo').html('<i class="fa fa-'+$.cookie()['usertype']+' fa-lg">&nbsp;</i>'+username + '<span class="caret"></span>');
    }
    $('#usernav').removeClass('hide');
} else {
    $('#user-login').removeClass('hide');
}

$('#user-login').click(function() {
    $('#my-login-modal').modal();
    $('#login-button').click(function() {
        var username = $('#username').val();
        var password = $('#password').val();
        var remembered = $(".remembered")[0].checked;
        if (username == '' || password == '') {
            if (!$('#error-login').hasClass('hide')) {
                $('#error-login').addClass('hide');
            }
            $('#blank-login').removeClass('hide');
        } else {
            $.post('/auth/login/', {
                username : username,
                password : password,
                remembered : remembered
            }, function(res) {
                if (res.status == '1') {
                    $('#my-login-modal').modal('hide');
                    //var login_html = '<span class="logout"><a href="#">' + username + '</a>  <a href="/auth/accounts/logout/">logout</a></span>';
                    //$('#user-login').after(login_html);
                    $('#user-login').addClass('hide');
                    if (username.length > 12) {
                        $('#userinfo').html('<i class="fa fa-'+$.cookie()['usertype']+' fa-lg">&nbsp;</i>'+username.substring(0, 12) + '...<span class="caret"></span>');
                    } else {
                        $('#userinfo').html('<i class="fa fa-'+$.cookie()['usertype']+' fa-lg">&nbsp;</i>'+username + '<span class="caret"></span>');
                    }
                    $('#usernav').removeClass('hide');

                } else {
                    if (!$('#blank-login').hasClass('hide')) {
                        $('#blank-login').addClass('hide');
                    }
                    $('#error-login').removeClass('hide');
                }
            })
        }
    });
    $.formUtils.addValidator({
        name : 'custom-confirm',
        validatorFunction : function(value, $el, config, language, $form) {
            console.log($("#id_password1").text())
            return $("#id_password1").val() == $("#id_password2").val();
        },
        errorMessage : 'Values could not be confirmed',
        errorMessageKey : 'notconfimed'
    });

    $.validate({
        modules : 'security',
    });
    $('#register-button').click(function() {

        $.ajax({
            url : "/auth/register/",
            type : "POST",
            data : $("#register-form").serialize(),
            success : function(response) {
                if (response['status'] == '0') {
                    $('#error-register').removeClass('hide');
                } else {
                    $('#my-login-modal').modal('hide');
                    window.location.reload();
                }
            }
        });
    });
});
$("#user-dropdown").width($("#usernav").css("width"));