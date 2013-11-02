from django.conf.urls import patterns, include, url, static
from django.contrib.auth.views import login, logout


urlpatterns = patterns('',
    url(r'', include('social.apps.django_app.urls', namespace='social')),
    url(r'^login/$', 'auth.views.login'),
    url(r'^accounts/logout/$', 'auth.views.logout'),
    url(r'^register/$', 'auth.views.register'),
    url(r'^check_username/$', 'auth.views.check_username'),
    url(r'^signup-email/', 'auth.views.signup_email'),
    url(r'^email-sent/', 'auth.views.validation_sent'),
    url(r'^done/$', 'auth.views.done', name='done'),
    url(r'^email/$', 'auth.views.require_email', name='require_email'),
)
