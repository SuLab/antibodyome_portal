from django.contrib import admin
from upload.models import Project, Sample

class ProjectAdmin(admin.ModelAdmin):
    # ...
    list_display = ('owner', 'title', 'created')


class SampleAdmin(admin.ModelAdmin):
    # ...
    list_display = ('name', 'created')

admin.site.register(Project, ProjectAdmin)
admin.site.register(Sample, SampleAdmin)