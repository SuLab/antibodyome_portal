# Create your views here.
import base64
import hmac
import hashlib
import json

from django.conf import settings
from django.http import HttpResponse, HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt
from upload.models import Project, Sample
from upload.util import AbomeListView, AbomeDetailView, ComplexEncoder
from django.core.serializers import serialize
from django.views.decorators.http import require_http_methods
from django.db.models.query_utils import Q
from upload.remote_data import get_ab_data

CREATE_SUCCESS = 1
CREATE_FAILURE = 0

SUCCESS = 1
FAILURE = 0

S3 = None

try:
    import boto
    from boto.s3.connection import S3Connection, Key
    boto.set_stream_logger('boto')
    S3 = S3Connection(settings.AMAZON_STORAGE['ACCESS_KEY'], settings.AMAZON_STORAGE['SECRET_KEY'])
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
    user = request.user
    content = json.loads(request.body)
    sample_contents = content['samples']
    project = Project(owner=user) 
    meta = {'platform':content['platform'], 'keywords':content['keywords']}
    content.pop('platform')
    content.pop('keywords')    
    project.__dict__.update(content)
    project.metadata = meta
    data = {}
    try:
        print project
        project.save()
        data['status'] = CREATE_SUCCESS
        for sample_content in sample_contents:
            try:
                Sample(
                    project_id=project.id,
                    name=sample_content['name'],
                    uuid=sample_content['uuid'],
                    filename=sample_content['filename'],
                    description=sample_content['description']).save()
            except Exception, e:
                data['status'] = CREATE_FAILURE
                data['error'] = "Create Sample error! please try again."
                print e
        data['project_id'] = project.id
    except:
        data['status'] = CREATE_FAILURE
        data['error'] = "Create Project error! please try again."

    return HttpResponse(json.dumps(data), content_type="application/json")


def update_project(request, id):
    user = request.user
    content = json.loads(request.body)
    data = {}
    sample_contents = content['samples']
    p = Project.objects.get(pk=id)
    if user == p.owner:
        data['status'] = CREATE_SUCCESS
        for sc in sample_contents:
            try:
                if 'id' in sc:
                    try:
                        sample = Sample.objects.get(id=sc['id'])
                    except Sample.DoesNotExist:
                        sample = None
                else:
                    sample = Sample(project_id=p.id, uuid=sc['uuid'], filename=sc['filename'])
                    p.status = 1
                    p.save()
                sample.name = sc['name']
                sample.description = sc['description']
                sample.save()
            except Exception as e:
                raise e
                data['status'] = CREATE_FAILURE
                data['error'] = "Edit Sample error! please try again."
        data['project_id'] = p.id
        content.pop('samples')
        p.__dict__.update(content)
        try:
            p.save()
        except Exception as e:
            data['status'] = CREATE_FAILURE
            data['error'] = "Edit Project error! please try again."
        return HttpResponse(json.dumps(data), content_type="application/json")
    else:
        return HttpResponseForbidden()


def delete_sample(request, id):
    user = request.user
    data = {}
    try:
        sample = Sample.objects.get(pk=id)
        if sample.project.owner == user:
            sample.delete()
            data['status'] = SUCCESS
        else:
            return HttpResponseForbidden()
    except:
        sample = None
        data['status'] = FAILURE
        data['error'] = "Delete Sample error! please try again."
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
        return HttpResponse('fail', status=404, content_type="application/json")


class ProjectList(AbomeListView):
    model = Project

    def get_queryset(self):
        key = self.request.GET.get('key')
        user = self.request.user
        if key == 'all':
            qs = Project.objects.filter(Q(owner=user) | Q(permission=0)).order_by('-lastmodified')
        elif key == 'owner':
            qs = Project.objects.filter(owner=user).order_by('-created')
        self.queryset = qs
        return qs

    def render_to_response(self, context):

        res = {
            'detail': context['object_list'],
            'prev': context['page_obj'].has_previous(),
            'next': context['page_obj'].has_next(),
            'count': self.queryset.count()
        }
        return HttpResponse(json.dumps(res, cls=ComplexEncoder), content_type="application/json")


class ProjectDetail(AbomeDetailView):
    model = Project

    def render_to_response(self, context):

        p = context['object']
        p_j = json.loads(serialize('json', [p])[1:-1])['fields']
        p_j = json.loads(serialize('json', [p])[1:-1])['fields']
        user = self.request.user
        p_j['user'] = user.id
        s_qs = Sample.objects.filter(project=p).order_by('created')
        p_j['samples'] = list(s_qs.values())
        return HttpResponse(json.dumps(p_j, cls=ComplexEncoder), content_type="application/json")


@require_http_methods(["GET"])
def sample_ab(request, id):    
    if id is not None:
        #res = get_ab_data(id)
        res = {"variable": {"IGHV1-69*01": 18582, "IGHV1-69*02": 140001, "IGHV1-69*03": 73, "IGHV1-69*04": 43163, "IGHV1-69*05": 717494, "IGHV1-69*06": 2952, "IGHV1-69*07": 67, "IGHV1-69*08": 48774, "IGHV1-69*09": 741, "IGHV5-a*04": 8, "IGHV3-74*01": 2927, "IGHV3-74*02": 1, "IGHV3-74*03": 106, "IGHV2-5*02": 2, "IGHV2-5*03": 10, "IGHV2-5*01": 4272, "IGHV2-5*06": 2, "IGHV2-5*04": 24, "IGHV2-5*05": 58, "IGLV2-14*03": 1, "IGHV2-5*08": 89, "IGHV3-9*01": 1208, "IGHV4-b*01": 7586, "IGHV3-63*01": 3, "IGHV4-b*02": 3275, "IGHV3/OR15-7*02": 1, "IGHV3-64*04": 9, "IGHV1/OR15-5*01": 1, "IGHV3-64*01": 968, "IGHV3-64*03": 5, "IGHV3-64*02": 407, "IGHV4-34*07": 16, "IGHV4-34*06": 16, "IGHV4-34*04": 18, "IGHV4-34*03": 17, "IGHV4-34*02": 353, "IGHV4-34*01": 5756, "IGHV3-52*01": 61, "IGHV7-4-1*05": 2, "IGHV4-34*09": 31, "IGHV4-34*08": 13, "IGHV3-30*17": 8, "IGHV3-30*16": 1, "IGHV3-30*15": 14, "IGHV3-30*14": 97, "IGHV3-30*13": 13, "IGHV3-30*12": 17, "IGHV3-30*11": 10, "IGHV3-30*10": 22, "IGHV3/OR16-10*01": 6, "IGHV3-30*19": 307, "IGHV3-30*18": 2171, "IGHV2-5*10": 493, "IGHV3-13*04": 3, "IGHV4-28*01": 73, "IGHV5-a*01": 9, "IGHV3-62*01": 1, "IGHV1-2*04": 3925, "IGHV1-2*05": 1671, "IGHV1-2*02": 103495, "IGHV1-2*03": 15, "IGHV1-2*01": 282, "IGHV3-33*05": 45, "IGHV3-33*04": 10, "IGHV1-69*12": 41477, "IGHV3-33*06": 262, "IGHV3-33*01": 1802, "IGHV3-33*03": 89, "IGHV3-33*02": 21, "IGHV4-28*02": 22, "IGHV4-28*03": 4, "IGHV3-21*04": 396, "IGHV3-66*04": 4, "IGHV3-21*02": 3, "IGHV3-21*03": 69, "IGHV3-35*01": 11, "IGHV3-21*01": 8146, "IGHV4-59*06": 24, "IGHV1-18*01": 171576, "IGHV1-18*02": 8, "IGHV1/OR15-9*01": 2, "IGHV3-19*01": 3, "IGHV4-34*11": 27, "IGHV4-34*12": 41, "IGHV4-34*13": 23, "IGHV1-f*02": 4, "IGHV3-30-3*02": 62, "IGHV1-f*01": 37757, "IGHV4-59*08": 276, "IGHV3/OR16-15*02": 1, "IGHV3-30*04": 982, "IGHV3-30*05": 3, "IGHV3-30*06": 7, "IGHV3-30*07": 10, "IGHV3-30*01": 11, "IGHV3-30*02": 4593, "IGHV3-30*03": 511, "IGHV3-NL1*01": 7, "IGHV4-28*06": 38, "IGHV3-72*01": 510, "IGHV3-30*08": 8, "IGHV3-30*09": 239, "IGHV4-28*04": 2, "IGHV4-28*05": 1, "IGHV2-70*07": 1, "IGHV2-70*06": 3, "IGHV2-70*01": 175, "IGHV4-31*09": 5, "IGHV2-70*03": 11, "IGHV1-8*01": 86690, "IGHV4-31*04": 3, "IGHV4-31*05": 6, "IGHV4-31*06": 2, "IGHV4-31*10": 10, "IGHV2-70*09": 1398, "IGHV2-70*08": 2, "IGHV4-31*02": 664, "IGHV4-31*03": 2060, "IGHV4-59*05": 32, "IGHV3-7*03": 2315, "IGHV3-7*02": 101, "IGHV3-7*01": 2278, "IGHV4-59*03": 70, "IGHV4-30-2*02": 9, "IGHV4-30-2*03": 41, "IGHV4-30-2*01": 534, "IGHV4-30-2*04": 42, "IGHV4-30-2*05": 58, "IGHV4-59*01": 8665, "IGHV7-34-1*02": 2, "IGHV3-48*03": 3806, "IGHV3-15*08": 3, "IGKV3-15*01": 1, "IGHV2-70*12": 27, "IGHV2-70*10": 324, "IGHV2-70*11": 34, "IGHV1/OR15-2*02": 3, "IGHV1/OR15-2*01": 1, "IGHV3/OR16-13*01": 3, "IGHV3-53*04": 5, "IGHV3-53*03": 11, "IGHV3-53*02": 3, "IGHV3-53*01": 469, "IGHV3-15*02": 2, "IGHV3-11*05": 1368, "IGHV3-11*04": 944, "IGHV3-h*01": 93, "IGHV3-11*01": 2340, "IGHV3-11*03": 420, "IGHV3-15*04": 275, "IGHV3/OR15-7*01": 2, "IGHV4-30-4*05": 26, "IGHV3-48*04": 343, "IGHV3-15*06": 19, "IGHV3-38*01": 3, "IGHV3-38*02": 1, "IGHV4-59*02": 228, "IGHV1-18*03": 138, "IGHV3-43*02": 56, "IGHV3-71*02": 22, "IGHV3-71*01": 3, "IGHV3-43*01": 1589, "IGHV1-c*01": 2, "IGHV3-48*01": 1668, "IGHV4-59*10": 11, "IGHV1-45*02": 2703, "IGHV1-45*03": 2, "IGHV1-45*01": 9, "IGHV1-58*01": 538, "IGHV3-32*01": 3, "IGLV3-10*01": 1, "IGHV1-68*01": 6, "IGKV1-27*01": 1, "IGHV5-51*04": 31, "IGHV5-51*03": 18, "IGHV5-51*02": 9, "IGHV5-51*01": 9160, "IGHV1/OR15-3*01": 3, "IGHV1/OR15-3*02": 12, "IGHV1/OR15-3*03": 2, "IGHV4-4*06": 13, "IGHV3-47*02": 3, "IGHV3-47*01": 6, "IGHV4-4*04": 2, "IGHV2/OR16-5*01": 2, "IGHV2-26*01": 373, "IGHV7-4-1*02": 127111, "IGHV4-4*03": 4, "IGHV3-22*01": 8, "IGHV7-4-1*01": 1270, "IGHV7-4-1*04": 166, "IGHV4-4*02": 861, "IGHV3-66*03": 19, "IGHV3-66*02": 1307, "IGHV3-66*01": 105, "IGHV4-31*01": 21, "IGHV6-1*01": 1314, "IGHV4-4*01": 74, "IGHV3/OR16-14*01": 1, "IGHV1-3*01": 103372, "IGHV1-58*02": 1471, "IGHV1-3*02": 142, "IGHV3-16*01": 4, "IGLV1-36*01": 1, "IGHV3-13*03": 103, "IGHV3-13*02": 5, "IGHV1-8*02": 7514, "IGHV3-d*01": 182, "IGHV4-59*09": 22, "IGHV1-24*01": 15827, "IGHV4-61*04": 41, "IGHV4-30-4*04": 7, "IGHV3-49*04": 416, "IGHV4-30-4*06": 2, "IGHV1/OR15-1*01": 4, "IGHV4-30-4*01": 4394, "IGHV4-30-4*02": 35, "IGHV4-30-4*03": 7, "IGHV4-4*07": 83, "IGHV4/OR15-8*01": 19, "IGHV4/OR15-8*02": 23, "IGHV4/OR15-8*03": 5, "IGHV1-69*13": 455363, "IGHV3-49*01": 9, "IGHV4-39*04": 16, "IGHV4-39*05": 1, "IGHV4-39*06": 58, "IGHV5-78*01": 11, "IGHV3-73*01": 379, "IGHV4-39*01": 4905, "IGHV4-39*02": 205, "IGHV4-39*03": 29, "IGHV3-30-3*01": 1301, "IGHV3-20*01": 3578, "IGHV3-49*03": 48, "IGHV1-46*03": 13473, "IGHV1-46*02": 2763, "IGHV1-46*01": 55431, "IGHV3-9*02": 6, "IGHV3/OR16-8*01": 6, "IGHV1/OR15-4*01": 3, "IGHV3-13*01": 417, "IGHV7-4-1*03": 1, "IGHV3-23*04": 2, "IGHV3-23*05": 19, "IGHV1-69*11": 61198, "IGHV1-69*10": 1581, "IGHV3-23*01": 8477, "IGHV3-23*02": 14, "IGHV3-23*03": 18, "IGHV7-81*01": 946, "IGHV3-15*01": 1952, "IGHV3-h*02": 128, "IGHV3-15*03": 7, "IGHV4-39*07": 3459, "IGHV3-15*05": 26, "IGHV4-61*08": 85, "IGHV3-15*07": 11, "IGHV4-59*07": 28, "IGHV4-61*05": 51, "IGHV4-31*08": 7, "IGHV4-61*07": 3, "IGHV4-61*06": 5, "IGHV4-61*01": 573, "IGHV4-61*03": 138, "IGHV4-61*02": 3380, "IGHV4-55*02": 10, "IGHV4-55*03": 13, "IGHV2-10*01": 1, "IGHV4-55*01": 19, "IGHV4-55*06": 2, "IGHV4-55*07": 6, "IGHV4-55*04": 3, "IGHV1/OR15-1*02": 2, "IGHV1/OR15-1*03": 3, "IGHV4-55*09": 2, "IGHV4-34*10": 50, "IGHV1/OR15-1*04": 32, "IGHV3-49*02": 44, "IGHV3-48*02": 24, "IGHV4-59*04": 31, "IGHV3/OR16-9*01": 17, "IGHV1-NL1*01": 3}, "diversity": {"": 44143, "IGHD2-2*01": 160007, "IGHD2-2*03": 138, "IGHD2-2*02": 26330, "IGHD2-15*01": 126774, "IGHD5-24*01": 30155, "IGHD6-13*01": 41714, "IGHD5-18*01": 167314, "IGHD3-9*01": 135536, "IGHD1-26*01": 151168, "IGHD4-11*01": 9951, "IGHD7-27*01": 12379, "IGHD1-14*01": 21355, "IGHD2-21*01": 50095, "IGHD2-21*02": 27255, "IGHD6-19*01": 55386, "IGHD6-25*01": 8359, "IGHD3-10*01": 422950, "IGHD3-10*02": 14726, "IGHD3-3*01": 141620, "IGHD3-3*02": 7305, "IGHD6-6*01": 11032, "IGHD1-7*01": 84689, "IGHD4-23*01": 58754, "IGHD3-16*02": 26410, "IGHD1-1*01": 71528, "IGHD4-17*01": 68371, "IGHD2-8*02": 6697, "IGHD2-8*01": 16752, "IGHD3-22*01": 252481, "IGHD5-12*01": 42941, "IGHD1-20*01": 2658, "IGHD3-16*01": 102465}, "joining": {"IGHJ2*01": 25215, "IGHJ6*01": 1211, "IGHJ2P*01": 823, "IGHJ6*03": 639432, "IGHJ1P*01": 713, "IGHJ1*01": 59176, "IGHJ3P*01": 629, "IGKJ2*03": 1, "IGLJ1*01": 1, "IGKJ1*01": 1, "IGHJ3*01": 95559, "IGHJ6*04": 19343, "IGHJ3*02": 270272, "IGHJ6*02": 8820, "IGLJ4*01": 1, "IGHJ5*01": 14713, "IGHJ4*01": 27483, "IGHJ4*03": 15349, "IGLJ2*01": 1, "IGHJ4*02": 825591, "IGHJ5*02": 395109}}
        return HttpResponse(json.dumps(res, cls=ComplexEncoder), content_type="application/json")
    else:
        return HttpResponse('fail', status=400, content_type="application/json")
