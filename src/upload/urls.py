from django.conf.urls import patterns, url
import views
import s3_views

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
    url(r'^sign-policy', s3_views.handle_s3_POST, \
        name="sign-policy-form-POST"),
    url(r'^delete-file/(?P<key>.+)$', s3_views.delete_s3_file,\
         name="delete-s3-file"),
    url(r'^create-project/', views.create_project, name="create-project"),
    url(r'^update-project/(?P<abp_id>.+)', views.update_project, \
        name="update_project"),
    url(r'^delete-sample/(?P<id>\d+)', views.delete_sample, \
        name="delete-sample"),
    url(r'^project/(?P<pk>\d+)/$', views.ProjectDetail.as_view(), \
        name="project-detail"),
    url(r'^project/(?P<abp_id>.+)/$', views.ABProjectDetail),
    url(r'^project-list/$', views.ProjectList.as_view(), name="project-list"),
    url(r'^project-analysis/(?P<abp_id>.+)/$', views.submit_analyze, \
        name="project-submit-analyze"),
    url(r'^project-analysis/(?P<slug>.+)/$', views.submit_analyze),
    url(r'^sample-ab/(?P<abs_id>.+)/$', views.sample_ab, name="sample-ab"),
    url(r'^random-ab/(?P<abs_id>.+)/$', views.random_ab, name="random-ab"),
    url(r'^ab-list/(?P<abs_id>.+)/$', views.list_ab, name="list-ab"),
    url(r'^ab-count/(?P<abs_id>.+)/$', views.count_ab, name="count-ab"),
    url(r'^ab-detail/$', views.ab_detail, name="ab-detail"),
    url(r'^convert-svg/$', views.convert_svg, name="convert-svg"),
    url(r'^file-down/$', views.file_download, name="file-download"),
    url(r'^search/$', views.ProjectSearch.as_view(), name="project-search"),
)
