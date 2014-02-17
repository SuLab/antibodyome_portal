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
from upload.remote_data import get_random_ab, get_ab, get_ab_data
from django.core.exceptions import ObjectDoesNotExist
import copy


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
    meta = {'platform': content['platform'], 'keywords': content['keywords']}
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

# test_res = {
#   "heavy": {
#     "total": 651439, 
#     "j": {
#       "IGHJ1*01": 12407, 
#       "IGHJ1P*01": 162, 
#       "IGHJ2*01": 2048, 
#       "IGHJ2P*01": 216, 
#       "IGHJ3*01": 18974, 
#       "IGHJ3*02": 55711, 
#       "IGHJ3P*01": 159, 
#       "IGHJ4*01": 12340, 
#       "IGHJ4*02": 203936, 
#       "IGHJ4*03": 151, 
#       "IGHJ5*01": 619, 
#       "IGHJ5*02": 74598, 
#       "IGHJ6*01": 489, 
#       "IGHJ6*02": 6597, 
#       "IGHJ6*03": 214739, 
#       "IGHJ6*04": 48293
#     }, 
#     "d": {
#       "": 3147, 
#       "IGHD1-1*01": 2784, 
#       "IGHD1-14*01": 50065, 
#       "IGHD1-20*01": 425, 
#       "IGHD1-26*01": 30822, 
#       "IGHD1-7*01": 10725, 
#       "IGHD2-15*01": 48294, 
#       "IGHD2-2*01": 209934, 
#       "IGHD2-2*02": 395, 
#       "IGHD2-2*03": 226, 
#       "IGHD2-21*01": 6213, 
#       "IGHD2-21*02": 10477, 
#       "IGHD2-8*01": 2085, 
#       "IGHD2-8*02": 7395, 
#       "IGHD3-10*01": 57704, 
#       "IGHD3-10*02": 2205, 
#       "IGHD3-16*01": 35244, 
#       "IGHD3-16*02": 7033, 
#       "IGHD3-22*01": 12736, 
#       "IGHD3-3*01": 52848, 
#       "IGHD3-3*02": 7744, 
#       "IGHD3-9*01": 11761, 
#       "IGHD4-11*01": 3439, 
#       "IGHD4-17*01": 1606, 
#       "IGHD4-23*01": 2047, 
#       "IGHD5-12*01": 7583, 
#       "IGHD5-18*01": 12712, 
#       "IGHD5-24*01": 5374, 
#       "IGHD6-13*01": 20061, 
#       "IGHD6-19*01": 13992, 
#       "IGHD6-25*01": 1001, 
#       "IGHD6-6*01": 4654, 
#       "IGHD7-27*01": 8708
#     }, 
#     "v": {
#       "IGHV1-18*01": 37198, 
#       "IGHV1-18*02": 1, 
#       "IGHV1-18*03": 46, 
#       "IGHV1-2*01": 27, 
#       "IGHV1-2*02": 65933, 
#       "IGHV1-2*03": 6, 
#       "IGHV1-2*04": 292, 
#       "IGHV1-2*05": 14, 
#       "IGHV1-24*01": 313, 
#       "IGHV1-3*01": 413, 
#       "IGHV1-3*02": 51526, 
#       "IGHV1-45*01": 2, 
#       "IGHV1-45*02": 1, 
#       "IGHV1-46*01": 948, 
#       "IGHV1-46*02": 7, 
#       "IGHV1-46*03": 2977, 
#       "IGHV1-58*01": 10, 
#       "IGHV1-58*02": 50, 
#       "IGHV1-68*01": 1, 
#       "IGHV1-69*01": 5101, 
#       "IGHV1-69*02": 519, 
#       "IGHV1-69*03": 26, 
#       "IGHV1-69*04": 6117, 
#       "IGHV1-69*05": 2313, 
#       "IGHV1-69*06": 1729, 
#       "IGHV1-69*07": 22, 
#       "IGHV1-69*08": 4385, 
#       "IGHV1-69*09": 4, 
#       "IGHV1-69*10": 164, 
#       "IGHV1-69*11": 17004, 
#       "IGHV1-69*12": 342882, 
#       "IGHV1-69*13": 2415, 
#       "IGHV1-8*01": 67646, 
#       "IGHV1-8*02": 1579, 
#       "IGHV1-c*01": 1, 
#       "IGHV1-f*01": 8778, 
#       "IGHV1-f*02": 4, 
#       "IGHV1/OR15-1*01": 5, 
#       "IGHV1/OR15-1*04": 3, 
#       "IGHV1/OR15-2*01": 2, 
#       "IGHV1/OR15-5*01": 1, 
#       "IGHV1/OR15-5*02": 2, 
#       "IGHV2-26*01": 45, 
#       "IGHV2-5*01": 679, 
#       "IGHV2-5*02": 2, 
#       "IGHV2-5*03": 5, 
#       "IGHV2-5*04": 5, 
#       "IGHV2-5*05": 19, 
#       "IGHV2-5*08": 20, 
#       "IGHV2-5*10": 170, 
#       "IGHV2-70*01": 6, 
#       "IGHV2-70*03": 1, 
#       "IGHV2-70*07": 1, 
#       "IGHV2-70*08": 1, 
#       "IGHV2-70*09": 305, 
#       "IGHV2-70*10": 8, 
#       "IGHV2-70*11": 38, 
#       "IGHV2-70*12": 2, 
#       "IGHV3-11*01": 104, 
#       "IGHV3-11*03": 25, 
#       "IGHV3-11*04": 322, 
#       "IGHV3-11*05": 3, 
#       "IGHV3-13*01": 46, 
#       "IGHV3-13*03": 12, 
#       "IGHV3-15*01": 710, 
#       "IGHV3-15*03": 1, 
#       "IGHV3-15*04": 12, 
#       "IGHV3-15*05": 33, 
#       "IGHV3-15*06": 1, 
#       "IGHV3-15*07": 11, 
#       "IGHV3-15*08": 3, 
#       "IGHV3-19*01": 2, 
#       "IGHV3-20*01": 483, 
#       "IGHV3-21*01": 890, 
#       "IGHV3-21*03": 267, 
#       "IGHV3-21*04": 13, 
#       "IGHV3-22*01": 10, 
#       "IGHV3-23*01": 1880, 
#       "IGHV3-23*02": 4, 
#       "IGHV3-23*03": 4, 
#       "IGHV3-23*04": 2, 
#       "IGHV3-23*05": 9, 
#       "IGHV3-30*01": 11, 
#       "IGHV3-30*02": 751, 
#       "IGHV3-30*03": 99, 
#       "IGHV3-30*04": 602, 
#       "IGHV3-30*05": 2, 
#       "IGHV3-30*06": 6, 
#       "IGHV3-30*07": 1, 
#       "IGHV3-30*08": 1, 
#       "IGHV3-30*09": 152, 
#       "IGHV3-30*10": 6, 
#       "IGHV3-30*11": 2, 
#       "IGHV3-30*12": 1, 
#       "IGHV3-30*13": 4, 
#       "IGHV3-30*14": 27, 
#       "IGHV3-30*15": 8, 
#       "IGHV3-30*16": 4, 
#       "IGHV3-30*17": 2, 
#       "IGHV3-30*18": 443, 
#       "IGHV3-30*19": 16, 
#       "IGHV3-30-3*01": 72, 
#       "IGHV3-30-3*02": 6, 
#       "IGHV3-33*01": 111, 
#       "IGHV3-33*02": 5, 
#       "IGHV3-33*03": 40, 
#       "IGHV3-33*04": 5, 
#       "IGHV3-33*05": 5, 
#       "IGHV3-33*06": 344, 
#       "IGHV3-38*01": 1, 
#       "IGHV3-43*01": 299, 
#       "IGHV3-43*02": 26, 
#       "IGHV3-47*02": 1, 
#       "IGHV3-48*01": 42, 
#       "IGHV3-48*02": 9, 
#       "IGHV3-48*03": 890, 
#       "IGHV3-48*04": 60, 
#       "IGHV3-49*02": 7, 
#       "IGHV3-49*03": 2, 
#       "IGHV3-49*04": 251, 
#       "IGHV3-52*01": 4, 
#       "IGHV3-52*02": 1, 
#       "IGHV3-53*01": 490, 
#       "IGHV3-53*03": 4, 
#       "IGHV3-53*04": 4, 
#       "IGHV3-62*01": 2, 
#       "IGHV3-64*01": 113, 
#       "IGHV3-64*02": 61, 
#       "IGHV3-64*03": 2, 
#       "IGHV3-64*04": 5, 
#       "IGHV3-64*05": 1, 
#       "IGHV3-66*01": 411, 
#       "IGHV3-66*02": 117, 
#       "IGHV3-66*03": 1, 
#       "IGHV3-66*04": 24, 
#       "IGHV3-7*01": 786, 
#       "IGHV3-7*02": 478, 
#       "IGHV3-7*03": 60, 
#       "IGHV3-71*01": 3, 
#       "IGHV3-71*02": 2, 
#       "IGHV3-72*01": 85, 
#       "IGHV3-73*01": 94, 
#       "IGHV3-74*01": 457, 
#       "IGHV3-74*03": 48, 
#       "IGHV3-9*01": 436, 
#       "IGHV3-9*02": 1, 
#       "IGHV3-NL1*01": 4, 
#       "IGHV3-d*01": 35, 
#       "IGHV3-h*01": 7, 
#       "IGHV3-h*02": 9, 
#       "IGHV3/OR16-10*01": 2, 
#       "IGHV3/OR16-12*01": 2, 
#       "IGHV3/OR16-13*01": 1, 
#       "IGHV3/OR16-15*01": 1, 
#       "IGHV3/OR16-8*01": 4, 
#       "IGHV3/OR16-9*01": 3, 
#       "IGHV4-28*01": 4, 
#       "IGHV4-28*02": 5, 
#       "IGHV4-28*04": 1, 
#       "IGHV4-28*05": 1, 
#       "IGHV4-28*06": 9, 
#       "IGHV4-30-2*01": 31, 
#       "IGHV4-30-2*03": 17, 
#       "IGHV4-30-2*04": 10, 
#       "IGHV4-30-2*05": 5, 
#       "IGHV4-30-4*01": 133, 
#       "IGHV4-30-4*02": 9, 
#       "IGHV4-30-4*04": 3, 
#       "IGHV4-30-4*06": 1, 
#       "IGHV4-31*01": 10, 
#       "IGHV4-31*02": 23, 
#       "IGHV4-31*03": 71, 
#       "IGHV4-31*05": 2, 
#       "IGHV4-31*08": 6, 
#       "IGHV4-31*09": 5, 
#       "IGHV4-31*10": 2, 
#       "IGHV4-34*01": 2913, 
#       "IGHV4-34*02": 7, 
#       "IGHV4-34*03": 11, 
#       "IGHV4-34*04": 5, 
#       "IGHV4-34*06": 15, 
#       "IGHV4-34*07": 4, 
#       "IGHV4-34*08": 2, 
#       "IGHV4-34*09": 7, 
#       "IGHV4-34*10": 20, 
#       "IGHV4-34*11": 5, 
#       "IGHV4-34*12": 19, 
#       "IGHV4-34*13": 5, 
#       "IGHV4-39*01": 160, 
#       "IGHV4-39*02": 38, 
#       "IGHV4-39*03": 12, 
#       "IGHV4-39*04": 2, 
#       "IGHV4-39*06": 36, 
#       "IGHV4-39*07": 2470, 
#       "IGHV4-4*01": 24, 
#       "IGHV4-4*02": 1239, 
#       "IGHV4-4*03": 1, 
#       "IGHV4-4*06": 5, 
#       "IGHV4-4*07": 26, 
#       "IGHV4-55*01": 9, 
#       "IGHV4-55*02": 1, 
#       "IGHV4-55*03": 4, 
#       "IGHV4-55*07": 4, 
#       "IGHV4-59*01": 2123, 
#       "IGHV4-59*02": 97, 
#       "IGHV4-59*03": 23, 
#       "IGHV4-59*04": 12, 
#       "IGHV4-59*05": 2, 
#       "IGHV4-59*07": 10, 
#       "IGHV4-59*08": 92, 
#       "IGHV4-59*09": 3, 
#       "IGHV4-59*10": 5, 
#       "IGHV4-61*01": 37, 
#       "IGHV4-61*02": 4513, 
#       "IGHV4-61*03": 24, 
#       "IGHV4-61*04": 6, 
#       "IGHV4-61*05": 6, 
#       "IGHV4-61*06": 1, 
#       "IGHV4-61*08": 14, 
#       "IGHV4-b*01": 118, 
#       "IGHV4-b*02": 878, 
#       "IGHV4/OR15-8*01": 8, 
#       "IGHV4/OR15-8*02": 22, 
#       "IGHV4/OR15-8*03": 5, 
#       "IGHV5-51*01": 1012, 
#       "IGHV5-51*02": 3, 
#       "IGHV5-51*03": 6, 
#       "IGHV5-51*04": 8, 
#       "IGHV5-78*01": 3, 
#       "IGHV5-a*01": 3, 
#       "IGHV5-a*02": 1, 
#       "IGHV5-a*03": 1, 
#       "IGHV5-a*04": 2, 
#       "IGHV6-1*01": 261, 
#       "IGHV7-4-1*01": 8, 
#       "IGHV7-4-1*02": 47
#     }
#   }, 
#   "kappa": {
#     "total": 98, 
#     "j": {
#       "IGKJ1*01": 15, 
#       "IGKJ2*01": 27, 
#       "IGKJ2*02": 1, 
#       "IGKJ2*03": 6, 
#       "IGKJ2*04": 1, 
#       "IGKJ3*01": 10, 
#       "IGKJ4*01": 25, 
#       "IGKJ4*02": 1, 
#       "IGKJ5*01": 12
#     }, 
#     "d": {}, 
#     "v": {
#       "IGKV1-16*01": 1, 
#       "IGKV1-16*02": 2, 
#       "IGKV1-33*01": 6, 
#       "IGKV1-39*01": 2, 
#       "IGKV1-5*03": 5, 
#       "IGKV1-9*01": 2, 
#       "IGKV2-28*01": 6, 
#       "IGKV2-29*03": 5, 
#       "IGKV2-30*01": 1, 
#       "IGKV2-30*02": 1, 
#       "IGKV3-11*01": 12, 
#       "IGKV3-15*01": 8, 
#       "IGKV3-20*01": 30, 
#       "IGKV3-20*02": 1, 
#       "IGKV3-NL5*01": 1, 
#       "IGKV3D-15*01": 4, 
#       "IGKV4-1*01": 11
#     }
#   }, 
#   "lambda": {
#     "total": 98, 
#     "j": {
#       "IGLJ1*01": 72,
#       "IGLJ2*01": 20,
#       "IGLJ3*02": 6
#     }, 
#     "d": {}, 
#     "v": {
#       "IGLV1-36*01": 1,
#       "IGLV1-40*01": 1,
#       "IGLV1-44*01": 11, 
#       "IGLV1-47*01": 3,
#       "IGLV1-50*01": 1, 
#       "IGLV2-11*01": 13, 
#       "IGLV2-14*01": 16, 
#       "IGLV2-14*02": 1,
#       "IGLV2-18*02": 5, 
#       "IGLV2-23*01": 6, 
#       "IGLV2-23*02": 20,
#       "IGLV2-8*01": 15,
#       "IGLV3-1*01": 3,
#       "IGLV5-45*03": 2
#     }
#   }
# }


@require_http_methods(["GET"])
def sample_ab(request, id):
    try:
        s = Sample.objects.get(pk=id)
    except ObjectDoesNotExist:
        return HttpResponse('no such sample', status=400, content_type="application/json")
    job_id = s.job_id
    #job_id = '52d42f1b9baecf05bfddffed'
    if job_id is not None:
        res = get_ab_data(job_id)
        rsp = {}
        rsp['heavy'] = copy.deepcopy(res['heavy'])
        rsp['light'] = copy.deepcopy(res['lambda'])
        rsp['light']['total'] += res['kappa']['total']
        rsp['light']['j'].update(res['kappa']['j'])
        rsp['light']['v'].update(res['kappa']['v'])
        return HttpResponse(json.dumps(rsp, cls=ComplexEncoder), content_type="application/json")
    else:
        return HttpResponse('fail', status=400, content_type="application/json")


@require_http_methods(["GET"])
def random_ab(request, id):
    #res = get_ab_data(id)
    try:
        s = Sample.objects.get(pk=id)
    except ObjectDoesNotExist:
        return HttpResponse('no such sample', status=400, content_type="application/json")
    job_id = s.job_id
    #job_id = '52d42f1b9baecf05bfddffed'
    abs = get_random_ab(job_id)
    return HttpResponse(json.dumps(abs, cls=ComplexEncoder), content_type="application/json")


@require_http_methods(["GET"])
def ab_detail(request):
    s_id = request.GET.get('sample')
    try:
        s = Sample.objects.get(pk=s_id)
    except ObjectDoesNotExist:
        return HttpResponse('no such sample', status=400, content_type="application/json")
    ab = request.GET.get('ab')
    job_id = s.job_id
    #job_id = '52d42f1b9baecf05bfddffed'
    abs = get_ab(job_id, ab)
    return HttpResponse(json.dumps(abs, cls=ComplexEncoder), content_type="application/json")
