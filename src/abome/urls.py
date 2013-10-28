from django.conf.urls import patterns, include, url, static
import upload
from abome import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'abome.views.home', name='home'),
    # url(r'^abome/', include('abome.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^upload/', include('upload.urls')),
    url(r'^registration/', include('registration.urls')),
)

urlpatterns += static.static(settings.STATIC_URL, document_root = settings.STATIC_ROOT )
