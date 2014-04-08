from django.db import models
from django.contrib.auth.models import User
from django_extensions.db.fields import AutoSlugField
import jsonfield
from django.core.serializers import serialize
from djorm_pgfulltext.fields import VectorField
from djorm_pgfulltext.models import SearchManager


class ProjectManager(models.Manager):
    def get_by_natual_key(self, user, name):
        return self.get(user=user, name=name)


class Project(models.Model):
    objects = ProjectManager()
    ab_id = models.CharField(max_length=20)
    owner = models.ForeignKey(User)
    organism = models.CharField(max_length=50)
    title = models.CharField(max_length=500)
    summary = models.TextField(blank=True)
    metadata = jsonfield.JSONField()
    lastmodified = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    slug = AutoSlugField(populate_from='title')
    STATUS_OPTIONS = (
        (0, 'editing'),
        (1, 'ready'),
        (2, 'analyzing'),
        (3, 'analyzed'),
        (4, 'analyze failed'),
    )
    PERMISSION_OPTIONS = (
        (0, 'public'),
        (1, 'private'),
    )
    permission = models.IntegerField(null=False, default=0, choices=PERMISSION_OPTIONS)
    status = models.IntegerField(null=False, default=0, choices=STATUS_OPTIONS)
    ready = models.BooleanField(default=False)
    search_index = VectorField()

    def natual_key(self):
        return (self.user, self.name)

    def __str__(self):
        return '"{}" by "{}"'.format(self.title, self.owner.username)

    search_manager = SearchManager(
            fields=('title', 'summary', 'metadata', 'slug',),
            config='pg_catalog.english',
            search_field='search_index',
            auto_update_search_field=True
        )

class Sample(models.Model):
    ab_id = models.CharField(max_length=20)
    project = models.ForeignKey(Project)
    name = models.CharField(max_length=500)
    description = models.TextField()
    filename = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
    lastmodified = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    uuid = models.CharField(max_length=256)
    status = models.IntegerField(null=False, default=1, choices=Project.STATUS_OPTIONS)
    job_id = models.CharField(max_length=256)

    def __str__(self):
        return '"{}" for project "{}"'.format(self.name, self.project.title)
