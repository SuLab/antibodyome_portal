# Create your views here.
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

import base64, hmac, hashlib, json

try:
    import boto
    from boto.s3.connection import S3Connection
    boto.set_stream_logger('boto')
    S3 = S3Connection(settings.AMAZON_STORAGE['ACCESS_KEY'], \
                      settings.AMAZON_STORAGE['SECRET_KEY'])
except Exception, e:
    print("Trying connect to S3 by boto, but failed.")
    print("Check if boto's installed and s3 keys are correct")


@csrf_exempt
def success_redirect_endpoint(request):
    """ This is where the upload will snd a POST request after the 
    file has been stored in S3.
    """
    return make_response(200)

@csrf_exempt
def sign_policy_document(request):
    """ Sign and return the policy doucument for a simple upload.
    http://aws.amazon.com/articles/1434/#signyours3postform
    """
    policy_document = json.loads(request.body)
    policy = base64.b64encode(json.dumps(policy_document))
    signature = base64.b64encode(hmac.new(settings.AMAZON_STORAGE['SECRET_KEY'], policy, hashlib.sha1).digest())
    return make_response(200, json.dumps({'policy': policy, 'signature': signature}))


def make_response(status=200, content=None):
    """ Construct an HTTP response. Fine Uploader expects 'application/json'.
    """
    response = HttpResponse()
    response.status_code = status
    response['Content-Type'] = "application/json"
    response.content = content
    return response
