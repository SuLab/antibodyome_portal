from django.conf.urls import patterns, include, url, static
from django.contrib.auth.views import login, logout


urlpatterns = patterns('',
    url(r'^login/$', 'registration.views.login'),
    url(r'^accounts/logout/$', 'registration.views.logout'),
    url(r'^accounts/register/$', 'registration.views.register'),
)
