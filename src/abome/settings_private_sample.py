#create settings_private.py according to this file and set your secrets
AMAZON_STORAGE = {
    'ACCESS_KEY': "",
    'SECRET_KEY': "",
    'BUCKET_NAME': '',
    'MAX_SIZE': 0
}

#third auth configure
#twitter
SOCIAL_AUTH_TWITTER_KEY = ''
SOCIAL_AUTH_TWITTER_SECRET = ''
#facebook
SOCIAL_AUTH_FACEBOOK_KEY = ''
SOCIAL_AUTH_FACEBOOK_SECRET = ''
SOCIAL_AUTH_FACEBOOK_SCOPE = ['']
#SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {}
#google
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = ''
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = ''
#yahoo
SOCIAL_AUTH_YAHOO_OAUTH_KEY = ''
SOCIAL_AUTH_YAHOO_OAUTH_SECRET = ''

RPYC_TUNNEL = {
    'host': '<rpyc_host>',
    'user': '<user>',
    'keyfile': '<path_to_keyfile>'
}

RPYC_PORT = 18861
