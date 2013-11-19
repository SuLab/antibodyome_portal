from django.conf.urls import patterns, url
import views

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
    url(r'^sign-policy', views.handle_s3_POST, name="sign-policy-form-POST"),
    url(r'^create-project', views.create_project, name="create_project"),
    url(r'^create-sample/(?P<id>\d+)', views.create_sample, name="create_sample"),
)
