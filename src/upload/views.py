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
from upload.remote_data import RemoteRoot
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User


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
    print("Check if boto's installed and s3 keys are correct, \
                 keep on running migth encounter problems.")


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


def make_response(status=200, content=None):
    """ Construct an HTTP response. Fine Uploader expects 'application/json'.
    """
    response = HttpResponse()
    response.status_code = status
    response['Content-Type'] = "application/json"
    response.content = content
    return response


def set_ab_id(model, prefix):
    model.__setattr__('ab_id', '%s%05d' % (prefix, model.id))
    model.save()


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
        set_ab_id(project, 'ABP')
        data['status'] = CREATE_SUCCESS
        for sample_content in sample_contents:
            try:
                sample = Sample(
                    project_id=project.id,
                    name=sample_content['name'],
                    uuid=sample_content['uuid'],
                    filename=sample_content['filename'],
                    description=sample_content['description'])
                sample.save()
                set_ab_id(sample, 'ABS')
            except Exception, e:
                data['status'] = CREATE_FAILURE
                data['error'] = "Create Sample error! please try again."
                print e
        data['project_id'] = project.ab_id
    except Exception as e:
        print e
        data['status'] = CREATE_FAILURE
        data['error'] = "Create Project error! please try again."

    return HttpResponse(json.dumps(data), content_type="application/json")


def update_project(request, abp_id):
    user = request.user
    content = json.loads(request.body)
    data = {}
    sample_contents = content['samples']
    p = Project.objects.get(ab_id=abp_id)
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
                    sample = Sample(project_id=p.id, uuid=sc['uuid'],\
                                 filename=sc['filename'])
                    p.status = 1
                    p.save()
                sample.name = sc['name']
                sample.description = sc['description']
                sample.save()
                set_ab_id(sample, 'ABS')
            except Exception as e:
                raise e
                data['status'] = CREATE_FAILURE
                data['error'] = "Edit Sample error! please try again."
        data['project_id'] = p.ab_id
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
def submit_analyze(request, abp_id):
    try:
        p = Project.objects.get(ab_id=abp_id)
        p.status = 1
        p.ready = True
        p.save()
        return HttpResponse('{"result":"ok"}', content_type="application/json")
    except Exception, e:
        print e
        return HttpResponse('{"result":"failed"}', status=404, \
                            content_type="application/json")


class ProjectList(AbomeListView):
    model = Project

    def get_queryset(self):
        key = self.request.GET.get('key')
        user = self.request.user
        if key == 'all':
            qs = Project.objects.filter(Q(owner=user) | Q(permission=0)).\
                   order_by('-lastmodified')
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
        return HttpResponse(json.dumps(res, cls=ComplexEncoder),\
                         content_type="application/json")


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
        return HttpResponse(json.dumps(p_j, cls=ComplexEncoder), \
                               content_type="application/json")

    def get_object(self, queryset=None):
        obj = super(AbomeDetailView, self).get_object()
        if obj.owner != self.request.user and obj.permission == 1:
            raise HttpResponseForbidden('private project can not access')
        return obj


def ABProjectDetail(request, abp_id):
    try:
        p = Project.objects.get(ab_id=abp_id)
    except ObjectDoesNotExist:
        return HttpResponse('no such project', status=400, \
                            content_type="application/json")
    p_j = json.loads(serialize('json', [p])[1:-1])['fields']
    user = request.user
    p_j['user'] = user.id
    s_qs = Sample.objects.filter(project=p).order_by('created')
    p_j['samples'] = list(s_qs.values())
    return HttpResponse(json.dumps(p_j, cls=ComplexEncoder), \
                        content_type="application/json")


@require_http_methods(["GET"])
def sample_ab(request, abs_id):
    try:
        s = Sample.objects.get(ab_id=abs_id)
    except ObjectDoesNotExist:
        return HttpResponse('no such sample', status=400, \
                            content_type="application/json")
    job_id = s.job_id
    if job_id is not None:
        rr = RemoteRoot()
        res = rr.get_ab_data(job_id)
        res['sample'] = {'name': s.name, 'desc': s.description, \
                         'file': s.filename}
        return HttpResponse(json.dumps(res, cls=ComplexEncoder), \
                            content_type="application/json")
    else:
        return HttpResponse('fail', status=400, \
                            content_type="application/json")


@require_http_methods(["GET"])
def random_ab(request, abs_id):
    try:
        s = Sample.objects.get(ab_id=abs_id)
    except ObjectDoesNotExist:
        return HttpResponse('no such sample', status=400, \
                            content_type="application/json")
    job_id = s.job_id
    rr = RemoteRoot()
    res = rr.get_random_ab(job_id)
    return HttpResponse(json.dumps(res, cls=ComplexEncoder), \
                        content_type="application/json")


@require_http_methods(["GET"])
def list_ab(request, abs_id):
    try:
        s = Sample.objects.get(ab_id=abs_id)
    except ObjectDoesNotExist:
        return HttpResponse('no such sample', status=400, \
                            content_type="application/json")
    job_id = s.job_id
    filters = request.GET.get('filters', '')
    if filters != '':
        filters = json.loads(filters)
    start = request.GET.get('start', 0)
    limit = request.GET.get('limit', 50)
    rr = RemoteRoot()
    ab_li = rr.get_ab_list_no_count(job_id, filters=filters, \
                                start=start, limit=limit)
    res = []
    keys = ['id', 'v_gene_full', 'd_gene_full', \
            'j_gene_full']
    for e in ab_li['details']:
        res.append(dict(zip(keys, e)))
    return HttpResponse(json.dumps({'details': res}, \
                cls=ComplexEncoder), content_type="application/json")


@require_http_methods(["GET"])
def count_ab(request, abs_id):
    try:
        s = Sample.objects.get(ab_id=abs_id)
    except ObjectDoesNotExist:
        return HttpResponse('no such sample', status=400, \
                            content_type="application/json")
    job_id = s.job_id
    filters = request.GET.get('filters', '')
    if filters != '':
        filters = json.loads(filters)
    rr = RemoteRoot()
    count = rr.get_ab_list_count(job_id, filters=filters)
    return HttpResponse(json.dumps({'details': count}, \
                cls=ComplexEncoder), content_type="application/json")    


@require_http_methods(["GET"])
def ab_detail(request):
    ab_id = request.GET.get('sample')
    try:
        s = Sample.objects.get(ab_id=ab_id)
    except ObjectDoesNotExist:
        return HttpResponse('no such sample', status=400, \
                            content_type="application/json")
    ab = request.GET.get('ab')
    job_id = s.job_id
    rr = RemoteRoot()
    res = rr.get_ab_detail(job_id, ab)
    return HttpResponse(json.dumps(res, cls=ComplexEncoder), \
                        content_type="application/json")


import cairosvg
import uuid
from django.core.servers.basehttp import FileWrapper
import os


@require_http_methods(["POST"])
def convert_svg(request):
    svg = request.POST.get('svg')
    output_format = request.POST.get('output_format')

    file_name = str(uuid.uuid1())
    if output_format == 'png':
        file_name = file_name + '.png'
        f = open('../web-app/media/' + file_name, 'w')
        cairosvg.svg2png(bytestring=svg, write_to=f)
        f.close()
    elif output_format == 'pdf':
        file_name = file_name + '.pdf'
        f = open('../web-app/media/' + file_name, 'w')
        cairosvg.svg2pdf(bytestring=svg, write_to=f)
        f.close()
    else:
        file_name = file_name + '.svg'
        f = open('../web-app/media/' + file_name, 'w')
        f.write(svg)
        f.close()

    return HttpResponse(json.dumps('/upload/file-down/?name=' + file_name,\
                         cls=ComplexEncoder), content_type="application/json")


def file_download(request):
    file_name = request.GET.get('name')
    file_path = '../web-app/media/' + file_name
    wrapper = FileWrapper(file('../web-app/media/' + file_name))
    response = HttpResponse(wrapper, mimetype='application/octetstream')
    response['Content-Length'] = os.path.getsize(file_path)
    response['Content-Disposition'] = \
             'attachment; filename=%s' % file_path.split('/')[-1]
    return response


class ProjectSearch(AbomeListView):
    model = Project

    def get_queryset(self):
        query = self.request.GET.get('q',None)
        if query is None:
            self.queryset = Project.objects.none()
            return self.queryset
        projects = Project.search_manager.search(query)
        samples = Sample.search_manager.search(query)
        ids_p = projects.values_list('id', flat=True)
        ids_s = samples.values_list('project', flat=True)
        ids_p = list(ids_p)
        #match user's username
        ids_u = User.objects.filter(username__icontains=query)
        if ids_u.count() > 0:
            p2 = Project.objects.filter(owner__in=ids_u)
            ids_p2 = p2.values_list('id', flat=True)
            ids_p.extend(list(ids_p2))
        if ids_s.count() > 0:
            ids_p.extend(list(ids_s))
        self.queryset = Project.objects.filter(id__in=ids_p)
        return self.queryset

    def render_to_response(self, context):

        res = {
            'detail': context['object_list'],
            'prev': context['page_obj'].has_previous(),
            'next': context['page_obj'].has_next(),
            'count': self.queryset.count()
        }
        return HttpResponse(json.dumps(res, cls=ComplexEncoder), \
                            content_type="application/json")

