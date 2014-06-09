import signal
import threading
import time
from rpyc.utils.ssh import SshContext
import rpyc

from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.mail import send_mail

from upload.models import Project


class Analysis(threading.Thread):

    def __init__(self):
        '''
            "interval" is search time interval
        '''
        threading.Thread.__init__(self)
        self.SLEEP_TIME = 10
        self.stop = False
        self.status = None
        self.conn = None

    def setup_remote_host(self):
        sshctx = SshContext(**settings.RPYC_TUNNEL)
        self.conn = rpyc.ssh_connect(sshctx, settings.RPYC_PORT, config={"allow_public_attrs": True})
        print self.conn.root.status()
        #log = open("script.log", "w+")
        #self.conn.root.set_stdout(sys.stdout)
        #block until machine ready

    def prepare_workers(self):
        self.conn.root.prepare_workers()

    def finish_workers(self):
        self.conn.root.terminate_workers()

    def close_remote_host(self):
        if self.conn is not None:
            self.conn.root.reset_stdout()
            self.conn.close()

    def get_analysis_target(self):
        # import pdb;pdb.set_trace()
        try:
            p = Project.objects.filter(status__in=[Project.STATUS_READY, Project.STATUS_ANALYZING], ready=1).earliest('created')
        except Project.DoesNotExist:
            p = None
        return p

    def do_analysis(self, p):
        # import pdb;pdb.set_trace()
        print p
        samples = p.sample_set.filter(status__in=[Project.STATUS_READY, Project.STATUS_ANALYZING])
        if samples is not None:
            # project in analyzing status
            if p.status != Project.STATUS_ANALYZING:
                p.status = Project.STATUS_ANALYZING
                p.save()
            ab = self.conn.root
            for s in samples:
                # update local status
                self.status = [p.id, s.id, 0]
                if s.status == Project.STATUS_READY:
                    print 'sample status  is ready'
                    try:
                        key = str("s3:"+s.uuid)
                        print 'run igblast, key:%s'%key
                        # Start analysis sample's3:raw_data/2064_g1.fasta.gz'
                        job_id = ab.run_igblast(infile=key)
                        print 'igblast ok'
                        s.job_id = job_id
                        s.status = Project.STATUS_ANALYZING
                        s.save()
                    except Exception as e:
                        #raise e
                        s.status = Project.STATUS_FAILED
                        s.save()
                        continue
                else:
                    print 'sample is analyzing'
                    job_id = s.job_id

                while True:
                    print 'job_id: %s' %job_id
                    pro = ab.check_progress(job_id)
                    print pro
                    if pro is None:
                        s.status = Project.STATUS_FAILED
                        s.save()
                        break
                    pro = dict(pro)
                    total = 0
                    for k in pro:
                         total = total + pro[k]
                    if total == pro['SUCCESS']:
                        print "progress 100%"
                        s.status = Project.STATUS_ANALYZED
                        self.status[2] = 100
                        s.save()
                        break
                    else:
                        if 'FAIL'  in pro:
                            print 'progress failed'
                            s.status = Project.STATUS_FAILED
                            s.save()
                            break
                        else:
                            print "progress  " + str(100*pro['SUCCESS']/total) + "%"
                            self.status[2] = 100*pro['SUCCESS']/total
                    # sleep a while before next check
                    time.sleep(self.SLEEP_TIME)

            # all sample finished, determine project analyze result
            p.status = Project.STATUS_ANALYZED
            for s in samples:
                if s.status == Project.STATUS_FAILED:
                    p.status = Project.STATUS_FAILED
            p.save()
            if p.status == Project.STATUS_ANALYZED:
                '''python -m smtpd -n -c DebuggingServer localhost:1025'''
                #send_mail('hello', 'welcome to register.', 'localhost@example.com', [p.owner.email], fail_silently=False)

    def get_status(self):
        return self.status

    def run(self):
        print 'setup remote host'
        self.setup_remote_host()
        print 'host ready'
        while not self.stop:
            target = self.get_analysis_target()
            if target is not None:
                print 'acquire workers'
                self.prepare_workers()
                print  'analyze project: '+str(target)
                self.do_analysis(target)
            else:
                self.finish_workers()
            time.sleep(self.SLEEP_TIME)
        self.close_remote_host()

    def signal_handler(self, signal, frame):
        print 'You pressed Ctrl+C!'
        self.stop = True

    def catch_sinal(self):
        signal.signal(signal.SIGINT, self.signal_handler)

    def stop(self):
        self.stop = True


class Command(BaseCommand):
    def handle(self, *args, **options):
        thread = Analysis()
        thread.start()
