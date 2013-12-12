from django import forms
from django.forms import ModelForm
from django.contrib.auth.forms import UserCreationForm

attrs_dict = { 'class': 'required' }

class RegistrationForm(UserCreationForm):
    email = forms.CharField(max_length=50, required=True, widget=forms.TextInput());
    first_name = forms.CharField(max_length=30, required=False, widget=forms.TextInput());
    last_name = forms.CharField(max_length=30, required=False, widget=forms.TextInput());
    affiliation = forms.CharField(max_length=150, required=False, widget=forms.TextInput());
    #checkbox
 #   tou = forms.BooleanField(widget=forms.CheckboxInput(attrs=attrs_dict));
#    signup_ann = forms.BooleanField(widget=forms.CheckboxInput(), initial=True, required=False);

    #required for django_friends module, when user signs up via the link received from a join-request.
    #invitation_key = forms.CharField(max_length=40, required=False, widget=forms.HiddenInput())

    # # def clean_tou(self):
    # #     """
    # #     Validate that the user accepted the Terms of Service.

    # #     """
    # #     if self.cleaned_data.get('tou', False):
    # #         return self.cleaned_data['tou']
    # #     raise forms.ValidationError('You must agree to the terms to register')

    # def clean_email(self):
    #     if 'email' in self.cleaned_data:
    #         email = self.cleaned_data['email']
    #         return email


    def save(self):
        user = super(RegistrationForm, self).save()
        #now create user profile
        profile = user.profile_set.create(user=user)
        affiliation = self.cleaned_data.get('affiliation','')
        if affiliation:
            profile.affiliation = affiliation
        profile.save()
        for param in ['first_name', 'last_name', 'email']:
            value = self.cleaned_data.get(param, '')
            if value:
                setattr(user, param, value)
        user.save()
