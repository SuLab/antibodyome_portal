from django.conf.urls import patterns, url
import views

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns(
    '',
    # Examples:
    # url(r'^$', 'abome.views.home', name='home'),
    # url(r'^abome/', include('abome.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^sign-policy', views.handle_s3_POST, name="sign-policy-form-POST"),
    url(r'^create-project/', views.create_project, name="create-project"),
    #url(r'^create-project-success/', views.create_project_success, name="create-project-success"),
    url(r'^update-project/(?P<id>\d+)', views.update_project, name="update_project"),
    url(r'^delete-sample/(?P<id>\d+)', views.delete_sample, name="delete-sample"),
    url(r'^project/(?P<pk>\d+)/$', views.ProjectDetail.as_view(), name="project-detail"),
    url(r'^project-list/$', views.ProjectList.as_view(), name="project-list"),
    url(r'^project-analysis/(?P<pk>\d+)/$', views.submit_analyze, name="project-submit-analyze"),
    url(r'^delete-file/(?P<key>.+)$', views.delete_s3_file, name="delete-s3-file"),
)
