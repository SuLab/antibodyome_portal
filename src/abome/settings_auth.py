from settings import TEMPLATE_CONTEXT_PROCESSORS

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.JSONSerializer'

TEMPLATE_CONTEXT_PROCESSORS += (    
    'social.apps.django_app.context_processors.backends',
)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'social.backends.google.GoogleOAuth2',
    'social.backends.twitter.TwitterOAuth',
    'social.backends.facebook.FacebookOAuth2',
    'social.backends.facebook.FacebookAppOAuth2',
    'social.backends.yahoo.YahooOAuth',
    'social.backends.username.UsernameAuth',
    #for django 1.6
    #'social.apps.django_app.utils.BackendWrapper',
)

LOGIN_URL = '/auth/login/'
LOGIN_REDIRECT_URL = '/auth/done/'
URL_PATH = ''
SOCIAL_AUTH_STRATEGY = 'social.strategies.django_strategy.DjangoStrategy'
SOCIAL_AUTH_STORAGE = 'social.apps.django_app.default.models.DjangoStorage'

# SOCIAL_AUTH_EMAIL_FORM_URL = '/signup-email'

SOCIAL_AUTH_EMAIL_FORM_HTML = 'email_signup.html'
SOCIAL_AUTH_EMAIL_VALIDATION_FUNCTION = 'auth.mail.send_validation'
SOCIAL_AUTH_EMAIL_VALIDATION_URL = '/auth/email-sent/'
# SOCIAL_AUTH_USERNAME_FORM_URL = '/signup-username'
SOCIAL_AUTH_USERNAME_FORM_HTML = 'username_signup.html'

SOCIAL_AUTH_PIPELINE = (
    'social.pipeline.social_auth.social_details',
    'social.pipeline.social_auth.social_uid',
    'social.pipeline.social_auth.auth_allowed',
    'social.pipeline.social_auth.social_user',
    'social.pipeline.user.get_username',
    #'auth.pipeline.require_email',
    #'social.pipeline.mail.mail_validation',
    'social.pipeline.user.create_user',
    'social.pipeline.social_auth.associate_user',
    'social.pipeline.social_auth.load_extra_data',
    'social.pipeline.user.user_details'
)

