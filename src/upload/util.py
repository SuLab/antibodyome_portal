from json.encoder import JSONEncoder
import json
import datetime
from django.db.models.query import QuerySet
from django.core.serializers import serialize, deserialize
from django.db.models.base import Model
from django.views.generic.list import BaseListView
from django.views.generic.detail import BaseDetailView
from django.http import HttpResponse


#  an encoder that processes model, queryset by using serialize(),
#  while remove these field: {"pk": x, "model": "xxx", }

class ComplexEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Model):
            return json.loads(serialize('json', [obj])[1:-1])['fields']
        if isinstance(obj, QuerySet):
            obj = obj.values()
            obj = list(obj)
            return json.loads(json.dumps(obj, cls=ComplexEncoder))
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%d %H:%M')
        elif isinstance(obj, datetime.date):
            return obj.strftime('%Y-%m-%d')
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

    def jsonBack(self, json):
        if json[0] == '[':
            return deserialize('json', json)
        else:
            return deserialize('json', '[' + json + ']')


class AbomeListView(BaseListView):
    """
        list view that returns JSON data
    """
    paginate_by = 5

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponse('login please', content_type="application/json", status=401)
        return super(AbomeListView, self).get(request, *args, **kwargs)


class AbomeDetailView(BaseDetailView):
    """
        detail view that returns JSON data
    """
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponse('login please', content_type="application/json", status=401)
        return super(AbomeDetailView, self).get(request, *args, **kwargs)
