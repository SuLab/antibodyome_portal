from rpyc.utils.ssh import SshContext
import rpyc
from abome import settings
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
            sshctx = SshContext("54.200.130.110", user="ubuntu", keyfile=settings.SSH_KEY_PATH)
            self.conn = rpyc.ssh_connect(sshctx, 18861, config={"allow_public_attrs": True})
        except Exception, e:
            print e
            print 'Connection with remote host fail....'
            self.remote_root = None


def get_ab_data(job_id):
    rr = RemoteRoot()
    ab = rr.conn.root
    try:
        job = ab.get_job(job_id)
    except Exception:
        return None
    data = ab.get_post_processed_result(job['result_store'])['ab_counts']
    res = {}
    res['variable'] = dict(data['v'])
    res['joining'] = dict(data['j'])
    res['diversity'] = dict(data['d'])
    return res


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


def get_ab(job_id, ab_id):
    rr = RemoteRoot()
    ab = rr.conn.root
    try:
        job = ab.get_job(job_id)
    except Exception, e:
        print e
        return None
    ab_doc = ab.get_ab(job['result_store'], ab_id, as_str=True)
    return json.loads(ab_doc)
