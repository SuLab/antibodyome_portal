# Create your views here.
import base64, hmac, hashlib, json

from django.conf import settings
from django.http import HttpResponse
from django.utils import simplejson
from django.views.decorators.csrf import csrf_exempt
from upload.forms import ProjectForm
from upload.models import Project, Sample
from upload.util import AbomeListView, AbomeDetailView, ComplexEncoder
from django.core.serializers import serialize
from django.views.decorators.http import require_http_methods

CREATE_SUCCESS = 1
CREATE_FAILURE = 0

SUCCESS = 1
FAILURE = 0

S3 = None

try:
    import boto
    from boto.s3.connection import S3Connection, Key
    boto.set_stream_logger('boto')
    S3 = S3Connection(settings.AMAZON_STORAGE['ACCESS_KEY'], \
                      settings.AMAZON_STORAGE['SECRET_KEY'])
except Exception, e:
    print("Trying connect to S3 by boto, but failed.")
    print("Check if boto's installed and s3 keys are correct, keep on running migth encounter problems.")


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
        return make_response(200)
    else:
        return make_response(500)

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

def create_project(request):
    # import pdb;pdb.set_trace()
    user = request.user
    content = simplejson.loads(request.body)
    data = {}
    samples = content['samples']
    project = Project(owner=user)
    projectform = ProjectForm(content, instance=project)
    if projectform.is_valid():
        projectform.save()
        data['status'] = CREATE_SUCCESS
        for sample in samples:
            try:
                Sample(project_id=project.id, name=sample['name'], filename=sample['filename'], description=sample['description']).save()
            except:
                data['status'] = CREATE_FAILURE
        data['project_id'] = project.id
    else:
        data['status'] = CREATE_FAILURE
    response = HttpResponse(json.dumps(data), content_type="application/json")
    return response

def create_sample(request, id):
    contents = simplejson.loads(request.body)
    data = {}
    for content in contents:
        try:
            Sample(project_id=id, name=content['name'], filename=content['filename'], description=content['description']).save()
        except:
            data['status'] = CREATE_FAILURE
    data['status'] = CREATE_SUCCESS
    response = HttpResponse(json.dumps(data), content_type="application/json")
    return response

@require_http_methods(["POST"])
def submit_analyze(request, pk):
    try:
        p = Project.objects.get(pk=pk)
        p.status = 1
        p.ready = True
        p.save()
        return HttpResponse('ok', content_type="application/json")
    except Exception, e:
        print e
        return HttpResponse('fail', status = 404, content_type="application/json")


class ProjectList(AbomeListView):


    model = Project

    def render_to_response(self, context):
        res = {
          'detail': context['object_list'],
          'prev': context['page_obj'].has_previous(),
          'next': context['page_obj'].has_next()
        }
        return HttpResponse(json.dumps(res, cls=ComplexEncoder), content_type="application/json")


class ProjectDetail(AbomeDetailView):


    model = Project

    def render_to_response(self, context):

        p = context['object']
        p_j = json.loads(serialize('json',[p])[1:-1])['fields']
        s_qs = Sample.objects.filter(project=p)
        p_j['samples'] = list(s_qs.values())
        return HttpResponse(json.dumps(p_j, cls=ComplexEncoder), content_type="application/json")
