from django.db import models
from django.contrib.auth.models import User 
from django_extensions.db.fields import AutoSlugField
import jsonfield

class ProjectManager(models.Manager):
    def get_by_natual_key(self, user, name):
        return self.get(user=user, name=name)
        
class Project(models.Model):
    objects = ProjectManager()
    id = models.CharField(max_length=20, primary_key=True)
    owner = models.ForeignKey(User)
    title = models.CharField(max_length=500)
    summary = models.TextField(blank=True)
    metadata = jsonfield.JSONField()
    lastmodified = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now=True)
    slug = models.AutoField(populate_from='title')

    def natual_key(self):
        return (self.user, self.name)
        
class Sample(models.Model):
    id = models.CharField(max_length=20, primary_key=True)
    project = models.ForeignKey(Project)
    name = models.CharField(max_length=500)
    filename = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
