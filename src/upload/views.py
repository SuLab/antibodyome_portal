# Create your views here.
import base64, hmac, hashlib, json

from django.conf import settings
from django.http import HttpResponse
from django.utils import simplejson
from django.views.decorators.csrf import csrf_exempt

from upload.forms import ProjectForm
from upload.models import Project, Sample

CREATE_SUCCESS = 1
CREATE_FAILURE = 0

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
    return make_response(200, response_payload)

def sign_policy_document(policy_document):
    policy = base64.b64encode(json.dumps(policy_document))
    signature = base64.b64encode(hmac.new(settings.AMAZON_STORAGE['SECRET_KEY'], policy, hashlib.sha1).digest())
    return {
        'policy': policy,
        'signature': signature
    }

def sign_headers(headers):
    return {
        'signature': base64.b64encode(hmac.new(settings.AMAZON_STORAGE['SECRET_KEY'], headers, hashlib.sha1).digest())
    }

def make_response(status=200, content=None):
    """ Construct an HTTP response. Fine Uploader expects 'application/json'.
    """
    response = HttpResponse()
    response.status_code = status
    response['Content-Type'] = "application/json"
    response.content = content
    return response

# def create_project(request):
#     user = request.user
#     content = simplejson.loads(request.body)
#     sample_list = content['sample_list']
#     data = {}
#     print content
#     project = Project(owner=user)
#     projectform = ProjectForm(content, instance=project)
#     if projectform.is_valid():
#         projectform.save()
#         if sample_list:
#             for sample in sample_list:
#                 sample_model = Sample(project=project, name=sample['name'], filename=sample['filename'], description=sample['description'])
#                 sample_model.save()
#         data['status'] = UPLOAD_SUCCESS
#     else:
#         data['status'] = UPLOAD_FAILURE
#     response = HttpResponse(json.dumps(data), content_type="application/json")
#     return response

def create_project(request):
    user = request.user
    content = simplejson.loads(request.body)
    data = {}
    project = Project(owner=user)
    projectform = ProjectForm(content, instance=project)
    if projectform.is_valid():
        projectform.save()
        data['status'] = CREATE_SUCCESS
        data['project_id'] = project.id
    else:
        data['status'] = CREATE_FAILURE
    response = HttpResponse(json.dumps(data), content_type="application/json")
    return response

def create_sample(request, id):
    content = simplejson.loads(request.body)
    data = {}
    try:
        Sample(project_id=id, name=content['name'], filename=content['filename'], description=content['description']).save()
    except:
        data['status'] = CREATE_FAILURE
    else:
        data['status'] = CREATE_SUCCESS
    response = HttpResponse(json.dumps(data), content_type="application/json")
    return response