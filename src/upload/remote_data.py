from rpyc.utils.ssh import SshContext
import rpyc
from abome import settings

try:
    sshctx = SshContext("54.200.130.110", user="ubuntu", keyfile=settings.SSH_KEY_PATH)
    conn = rpyc.ssh_connect(sshctx, 18861, config={"allow_public_attrs": True})
    ab = conn.root
except Exception, e:
    print e
    print 'Connection with remote host fail....'

def get_ab_data(job_id):
    #just for test
    job_id = '52d42f1b9baecf05bfddffed'
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
    #just for test
    job_id = '52d42f1b9baecf05bfddffed'
    try:
        job = ab.get_job(job_id)
    except Exception:
        return None
    ab_li = ab.get_random_ab_ids(job['result_store'])
        