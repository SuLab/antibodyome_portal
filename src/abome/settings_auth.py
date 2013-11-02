from settings import TEMPLATE_CONTEXT_PROCESSORS

SESSION_SERIALIZER = 'django.contrib.sessions.serializers.JSONSerializer'

TEMPLATE_CONTEXT_PROCESSORS += (    
    'social.apps.django_app.context_processors.backends',
)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'social.backends.open_id.OpenIdAuth',
    'social.backends.google.GoogleOpenId',
    'social.backends.google.GoogleOAuth2',
    'social.backends.google.GoogleOAuth',
    'social.backends.google.GooglePlusAuth',
    'social.backends.twitter.TwitterOAuth',
    'social.backends.yahoo.YahooOpenId',
    'social.backends.stripe.StripeOAuth2',
    'social.backends.persona.PersonaAuth',
    'social.backends.facebook.FacebookOAuth2',
    'social.backends.facebook.FacebookAppOAuth2',
    'social.backends.yahoo.YahooOAuth',
    'social.backends.angel.AngelOAuth2',
    'social.backends.behance.BehanceOAuth2',
    'social.backends.bitbucket.BitbucketOAuth',
    'social.backends.box.BoxOAuth2',
    'social.backends.linkedin.LinkedinOAuth',
    'social.backends.linkedin.LinkedinOAuth2',
    'social.backends.github.GithubOAuth2',
    'social.backends.foursquare.FoursquareOAuth2',
    'social.backends.instagram.InstagramOAuth2',
    'social.backends.live.LiveOAuth2',
    'social.backends.vk.VKOAuth2',
    'social.backends.dailymotion.DailymotionOAuth2',
    'social.backends.disqus.DisqusOAuth2',
    'social.backends.dropbox.DropboxOAuth',
    'social.backends.evernote.EvernoteSandboxOAuth',
    'social.backends.fitbit.FitbitOAuth',
    'social.backends.flickr.FlickrOAuth',
    'social.backends.livejournal.LiveJournalOpenId',
    'social.backends.soundcloud.SoundcloudOAuth2',
    'social.backends.thisismyjam.ThisIsMyJamOAuth1',
    'social.backends.stocktwits.StocktwitsOAuth2',
    'social.backends.tripit.TripItOAuth',
    'social.backends.twilio.TwilioAuth',
    'social.backends.xing.XingOAuth',
    'social.backends.yandex.YandexOAuth2',
    'social.backends.douban.DoubanOAuth2',
    'social.backends.mixcloud.MixcloudOAuth2',
    'social.backends.rdio.RdioOAuth1',
    'social.backends.rdio.RdioOAuth2',
    'social.backends.yammer.YammerOAuth2',
    'social.backends.stackoverflow.StackoverflowOAuth2',
    'social.backends.readability.ReadabilityOAuth',
    'social.backends.skyrock.SkyrockOAuth',
    'social.backends.tumblr.TumblrOAuth',
    'social.backends.reddit.RedditOAuth2',
    'social.backends.steam.SteamOpenId',
    'social.backends.podio.PodioOAuth2',
    'social.backends.amazon.AmazonOAuth2',
    'social.backends.email.EmailAuth',
    'social.backends.username.UsernameAuth',
    #for django 1.6
    #'social.apps.django_app.utils.BackendWrapper',
)

LOGIN_URL = '/auth/login/'
LOGIN_REDIRECT_URL = '/auth/done/'
URL_PATH = ''
SOCIAL_AUTH_STRATEGY = 'social.strategies.django_strategy.DjangoStrategy'
SOCIAL_AUTH_STORAGE = 'social.apps.django_app.default.models.DjangoStorage'
#google
SOCIAL_AUTH_GOOGLE_OAUTH_SCOPE = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/userinfo.profile'
]
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
    'auth.pipeline.require_email',
    'social.pipeline.mail.mail_validation',
    'social.pipeline.user.create_user',
    'social.pipeline.social_auth.associate_user',
    'social.pipeline.social_auth.load_extra_data',
    'social.pipeline.user.user_details'
)

