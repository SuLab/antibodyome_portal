var csrftoken = $.cookie('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    crossDomain : false, // obviates need for sameOrigin test
    beforeSend : function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

function onKeyDown() {
    if (event.keyCode == 13) {
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
                        $('#userinfo').html('<img class="background-img" src="./3rd/icon/' + $.cookie()['usertype'] + '-16.png">&nbsp;</img>' + username.substring(0, 12) + '...<span class="caret"></span>');
                    } else {
                        $('#userinfo').html('<img class="background-img" src="./3rd/icon/' + $.cookie()['usertype'] + '-16.png">&nbsp;</img>' + username + '<span class="caret"></span>');
                    }
                    $('#usernav').removeClass('hide');

                } else {
                    if (!$('#blank-login').hasClass('hide')) {
                        $('#blank-login').addClass('hide');
                    }
                    $('#error-login').removeClass('hide');
                }
            });
        }
    }
}

function getLocation() {
    nameList = location.pathname.split("/");
    return nameList[nameList.length - 1];
}

switch(getLocation()) {
    case "home.html":
        $("#nav_home").addClass('active');
        break;
    case "upload.html":
        $("#nav_upload").addClass("active");
        break;
    case "about.html":
        break;
    default :
        break;
}

if ($.cookie()['username'] != 'null' && $.cookie()['username'] != undefined) {
    var username = $.cookie()['username'];
    $('#user-login').addClass('hide');
    $('#userinfo').html("<i class='icon-user icon-large'></i>" + username + '<span class="caret"></span>');
    $('#usernav').removeClass('hide');
} else {
    $('#user-login').removeClass('hide');
}

$(".upload-btn").click(function() {
    if ($.cookie()['username'] != 'null' && $.cookie()['username'] != undefined) {
        window.location.href = "upload.html";
    } else {
        $('#modal-header').removeClass('hide');
        $('#modal-header').html('<h4 class="modal-title">Login first</h4>');
        $('#my-login-modal').modal();

    }
});

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
                    $('#userinfo').html('<img class="background-img" src="./3rd/icon/' + $.cookie()['usertype'] + '-16.png">&nbsp;</img>' + username.substring(0, 12) + '...<span class="caret"></span>');
                } else {
                    $('#userinfo').html('<img class="background-img" src="./3rd/icon/' + $.cookie()['usertype'] + '-16.png">&nbsp;</img>' + username + '<span class="caret"></span>');
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

$('#user-login').click(function() {
    $('#username').focus();
    $('#id_username').focus();
    $('#modal-header').addClass('hide');
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
                    $('#user-login').addClass('hide');
                    if (username.length > 12) {
                        $('#userinfo').html('<img class="background-img" src="./3rd/icon/' + $.cookie()['usertype'] + '-16.png">&nbsp;</img>' + username.substring(0, 12) + '...<span class="caret"></span>');
                    } else {
                        $('#userinfo').html('<img class="background-img" src="./3rd/icon/' + $.cookie()['usertype'] + '-16.png">&nbsp;</img>' + username + '<span class="caret"></span>');
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
