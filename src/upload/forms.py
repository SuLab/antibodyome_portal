from django import forms
from django.forms import ModelForm

from upload.models import Project

class ProjectForm(ModelForm):
	class Meta:
		model = Project
		fields = ('title', 'organism', 'summary')
