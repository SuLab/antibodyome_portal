import json
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.contrib.auth import authenticate,login as auth_login, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm, PasswordResetForm, SetPasswordForm, PasswordChangeForm

LOGIN_SUCCESS = 1
LOGIN_FAILURE = 0

def register(request):
    form = UserCreationForm()
    context = RequestContext(request, {'form': form})   
    if request.method == 'POST':
        user_form = UserCreationForm(request.POST)
        if user_form.is_valid():
            new_user = user_form.save()
            response = HttpResponseRedirect(reverse("registration.views.login"))
            return response
    return render_to_response("registration/register.html",context)

def login(request):
    username = request.POST.get('username')
    password = request.POST.get('password')
    user = authenticate(username=username, password=password)
    data = {}
    if user:
        auth_login(request, user)
        data['username'] = username
        data['status'] = LOGIN_SUCCESS
        response = HttpResponse(json.dumps(data), content_type="application/json")
        response.set_cookie('username', username)
    else:
        data['status'] = LOGIN_FAILURE
        response = HttpResponse(json.dumps(data), content_type="application/json")
    return response

def logout(request):
    auth_logout(request)
    response = HttpResponseRedirect("/web-app/home.html")
    response.delete_cookie('username')
    return response 
