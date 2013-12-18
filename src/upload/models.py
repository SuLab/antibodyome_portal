from django.db import models
from django.contrib.auth.models import User
from django_extensions.db.fields import AutoSlugField
import jsonfield
from django.core.serializers import serialize
import datetime

class ProjectManager(models.Manager):
    def get_by_natual_key(self, user, name):
        return self.get(user=user, name=name)


class Project(models.Model):
    objects = ProjectManager()
    #id = models.CharField(max_length=20, primary_key=True)    
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

    def natual_key(self):
        return (self.user, self.name)

    @property
    def samples(self):
        return self.sample_set.all()
        samples = self.sample_set.all()
        samples_dict = serialize('json',samples)
        return samples_dict

    @property
    def manifest(self):
        attribute_key_list = ['id','organism','title','summary','metadata', 'status', 'samples']
        entity_dict = {}
        for key in attribute_key_list:
            entity_dict[key] = self.__getattribute__(key)
        return entity_dict


class Sample(models.Model):
    #id = models.CharField(max_length=20, primary_key=True)
    project = models.ForeignKey(Project)
    name = models.CharField(max_length=500)
    description = models.TextField()
    filename = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
    lastmodified = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    uuid = models.CharField(max_length=40)
    status = models.IntegerField(null=False, default=1, choices=Project.STATUS_OPTIONS)
