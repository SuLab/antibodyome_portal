# Create your views here.
import base64
import hmac
import hashlib
import json
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt


S3 = None

try:
    import boto
    from boto.s3.connection import S3Connection, Key
    boto.set_stream_logger('boto')
    S3 = S3Connection(settings.AMAZON_STORAGE['ACCESS_KEY'], \
                      settings.AMAZON_STORAGE['SECRET_KEY'])
except Exception, e:
    print("Trying connect to S3 by boto, but failed.")
    print("Check if boto's installed and s3 keys are correct, \
                 keep on running migth encounter problems.")


@csrf_exempt
def success_redirect_endpoint(request):
    """ This is where the upload will snd a POST request after the
    file has been stored in S3.
    """
    return _make_response(200)


@csrf_exempt
def handle_s3_POST(request):
    """ Sign and return the policy doucument for a simple upload.
    http://aws.amazon.com/articles/1434/#signyours3postform
    """
    request_payload = json.loads(request.body)
    headers = request_payload.get('headers', None)
    if headers:
        response_data = sign_headers(headers)
    else:
        response_data = sign_policy_document(request_payload)
    response_payload = json.dumps(response_data)
    return _make_response(200, response_payload)


def delete_s3_file(request, key):
    """
    Handle file deletion requests. For this, we use the Amazon Python SDK,
    boto.
    """
    if S3:
        bucket_name = request.REQUEST.get('bucket')
        key_name = request.REQUEST.get('key')
        aws_bucket = S3.get_bucket(bucket_name, validate=False)
        aws_key = Key(aws_bucket, key_name)
        aws_key.delete()
        return _make_response(200)
    else:
        return _make_response(500)


def sign_policy_document(policy_document):
    policy = base64.b64encode(json.dumps(policy_document))
    signature = base64.b64encode(hmac.new(
                        settings.AMAZON_STORAGE['SECRET_KEY'],\
                        policy, hashlib.sha1).digest())
    return {
        'policy': policy,
        'signature': signature
    }


def sign_headers(headers):
    return {
        'signature': base64.b64encode(hmac.new(\
                    settings.AMAZON_STORAGE['SECRET_KEY'], \
                    headers, hashlib.sha1).digest())
    }


def _make_response(status=200, content=None):
    """ Construct an HTTP response. Fine Uploader expects 'application/json'.
    """
    response = HttpResponse()
    response.status_code = status
    response['Content-Type'] = "application/json"
    response.content = content
    return response
