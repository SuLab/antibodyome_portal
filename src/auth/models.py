from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.ForeignKey(User)
    affiliation = models.CharField(max_length=200)
