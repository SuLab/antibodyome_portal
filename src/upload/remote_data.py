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
            print 'connect to remote...'
            self.connect()
            self.job_map = []
        except Exception, e:
            print e
            print 'Connection with remote host fail....'
            self.conn = None
            self.root = None

    def connect(self):
        print 'connect to remote...'
        sshctx = SshContext(**settings.RPYC_TUNNEL)
        self.conn = rpyc.ssh_connect(sshctx, 18861, \
                                config={"allow_public_attrs": True})
        self.root = self.conn.root

    def job_to_result(self, job_id):
        try:
            job = self.root.get_job(job_id)
            return job['result_store']
        except Exception:
            return None

    #get job from remote server with job id
    def get_result_by_job(self, job_id):
        #cache job in memory
        if job_id in self.job_map:
            return self.job_map[job_id]
        try:
            job = self.root.get_job(job_id)
            return job['result_store']
        #may process connection exception and do reconnect
        except EOFError:
            print 'connection broken, reconnect'
            self.connect()
            return self.job_to_result(job_id)
        except Exception:
            return None

    def get_ab_data(self, job_id):
        try:
            data = self.root.get_post_processed_result(\
                    self.get_result_by_job(job_id), as_str=True)
            return json.loads(data)['ab_counts']
        except Exception, e:
            print e
            return None

    def get_random_ab(self, job_id):
        try:
            data = self.root.get_random_ab_ids(\
                    self.get_result_by_job(job_id))
            return list(data)
        except Exception, e:
            print e
            return None

    def get_ab_list(self, job_id, filters=None, start=0, limit=20):
        try:
            result = self.get_result_by_job(job_id)
            ab_count = self.root.get_ab_list(result, \
                        filters=filters, count_only=True)

            ab_li = self.conn.root.get_ab_list(result, \
                select='sn, v_gene_full, d_gene_full, j_gene_full', \
                filters=filters, start=start, limit=limit, as_str=True)
            return {'count': ab_count, 'details': json.loads(ab_li)}
        except Exception:
            return None

    def get_ab_list_no_count(self, job_id, filters=None, start=0, limit=20):
        try:
            result = self.get_result_by_job(job_id)
            ab_li = self.conn.root.get_ab_list(result, \
                select='sn, v_gene_full, d_gene_full, j_gene_full', \
                filters=filters, start=start, limit=limit, as_str=True)
            return json.loads(ab_li)
        except Exception:
            return None

    def get_ab_list_count(self, job_id, filters=None):
        try:
            result = self.get_result_by_job(job_id)
            count = self.conn.root.get_ab_list(result, \
                select='sn, v_gene_full, d_gene_full, j_gene_full', \
                filters=filters, count_only=True)
            return count
        except Exception:
            return None

    def get_ab_detail(self, job_id, ab_id):
        try:
            data = self.root.get_ab(self.get_result_by_job(job_id),\
                                     ab_id, as_str=True)
            return json.loads(data)
        except Exception, e:
            print e
            return None
