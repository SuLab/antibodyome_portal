from rpyc.utils.ssh import SshContext
import rpyc
from django.conf import settings
import json

remote_root = None


def singleton(cls, *args, **kw):
    instances = {}

    def _singleton():
        if cls not in instances:
            instances[cls] = cls(*args, **kw)
        return instances[cls]
    return _singleton


@singleton
class RemoteRoot(object):

    def __init__(self, x=0):
        try:
            print 'connect to remote'
            #sshctx = SshContext("54.200.130.110", user="ubuntu", keyfile=settings.SSH_KEY_PATH)
            sshctx = SshContext(**settings.RPYC_TUNNEL)
            self.conn = rpyc.ssh_connect(sshctx, 18861, config={"allow_public_attrs": True})
        except Exception, e:
            print e
            print 'Connection with remote host fail....'
            self.remote_root = None


def get_ab_data(job_id):
    rr = RemoteRoot()
    ab = rr.conn.root

#     try:
#         job = ab.get_job(job_id)
#     except Exception:
#         return None
    data = ab.get_post_processed_result('abome_data_20140109_buhpajlm', as_str=True)

#     res = {}
#     res['variable'] = dict(data['v'])
#     res['joining'] = dict(data['j'])
#     res['diversity'] = dict(data['d'])
    return json.loads(data)['ab_counts']


def get_random_ab(job_id):
    rr = RemoteRoot()
    ab = rr.conn.root
    try:
        job = ab.get_job(job_id)
    except Exception, e:
        print e
        return None
    ab_li = ab.get_random_ab_ids(job['result_store'])
    return list(ab_li)


def get_ab_list(job_id, filters=None, start=0, limit=20):
    rr = RemoteRoot()
    ab = rr.conn.root
    try:
        job = ab.get_job(job_id)
    except Exception, e:
        return None
    ab_count = ab.get_ab_list(job['result_store'], filters=filters, count_only=True)
    ab_li = ab.get_ab_list(job['result_store'], select='id_str, v_gene_full, d_gene_full, j_gene_full', filters=filters, start=start, limit=limit, as_str=True)
    ret = {'count':ab_count, 'details':json.loads(ab_li)}
    return ret

def get_ab(job_id, ab_id):
    rr = RemoteRoot()
    ab = rr.conn.root
    try:
        job = ab.get_job(job_id)
    except Exception, e:
        print e
        return None
    ab_doc = ab.get_ab(job['result_store'], ab_id, as_str=True)
    print ab_doc
    return json.loads(ab_doc)
