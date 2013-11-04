import json
from django import forms
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response,redirect
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate,login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from social.apps.django_app.default.models import UserSocialAuth
from auth.forms import RegistrationForm
LOGIN_SUCCESS = 1
LOGIN_FAILURE = 0

REGISTER_SUCCESS = 1
REGISTER_FAILURE = 0

def check_username(request):
    data = {}
    username = request.POST['username']
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        data['valid'] = True
    else:
        data['valid'] = False
        data['message'] = 'the user is already registered'
    response = HttpResponse(json.dumps(data), content_type="application/json")
    return response

def register(request):
    import pdb;pdb.set_trace()
    data = {}
    if request.method == 'POST':
        user_form = RegistrationForm(request.POST)
        if user_form.is_valid():
            new_user = user_form.save()
            username = request.POST.get('username')
            password = request.POST.get('password1')
            data['username'] = username
            data['status'] = REGISTER_SUCCESS
            user = authenticate(username=username, password=password)
            auth_login(request, user)
            response = HttpResponse(json.dumps(data), content_type="application/json")
            response.set_cookie('username', username, max_age=60*60*24*14)
            response.set_cookie('usertype', 'laptop')
        else:
            data['status'] = REGISTER_FAILURE
            response = HttpResponse(json.dumps(data), content_type="application/json")
        return response

def login(request):
    username = request.POST.get('username')
    password = request.POST.get('password')
    remembered = request.POST.get('remembered')
    user = authenticate(username=username, password=password)
    data = {}
    if user:
        auth_login(request, user)
        data['username'] = username
        data['status'] = LOGIN_SUCCESS
        response = HttpResponse(json.dumps(data), content_type="application/json")
        if remembered=='true':
            response.set_cookie('username', username, max_age=60*60*24*14)
            response.set_cookie('usertype', 'laptop')
        else:
            response.set_cookie('username', username)
            response.set_cookie('usertype', 'laptop')
    else:
        data['status'] = LOGIN_FAILURE
        response = HttpResponse(json.dumps(data), content_type="application/json")
    return response

def logout(request):
    auth_logout(request)
    response = HttpResponseRedirect("/web-app/home.html")
    response.delete_cookie('username')
    return response

@login_required
def done(request):
    """Login complete view, displays user data"""
    localuser = User.objects.get(username=request.user)
    socialuser = UserSocialAuth.objects.get(user = localuser)
    response = HttpResponseRedirect("/web-app/home.html")
    response.set_cookie("username",request.user.username.encode("utf-8"))
    response.set_cookie("usertype", socialuser.provider.split("-")[0])

    return response

def validation_sent(request):
    return render_to_response('validation_sent.html', {
        'email': request.session.get('email_validation_address')
    }, RequestContext(request))


def signup_email(request):
    return render_to_response('email_signup.html', {}, RequestContext(request))

'''
def require_email(request):
    if request.method == 'POST':
        request.session['saved_email'] = request.POST.get('email')
        backend = request.session['partial_pipeline']['backend']
        return redirect('social:complete', backend=backend)
    return HttpResponseRedirect("/web-app/email.html")
'''

