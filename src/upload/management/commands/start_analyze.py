from django.core.management.base import BaseCommand
#from placeholders import *

#from upload.analysis import Analysis

import threading
from django.conf import settings
#settings.configure()
import time
from rpyc.utils.ssh import SshContext
import rpyc
import sys
from django.core.exceptions import ObjectDoesNotExist
from upload.models import Project
from django.contrib.auth import models


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
        sshctx = SshContext("54.200.130.110", user = "ubuntu", keyfile = settings.SSH_KEY_PATH)#modify the keyfile to your own keyfile path
        self.conn = rpyc.ssh_connect(sshctx, 18861,config={"allow_public_attrs": True})
        print self.conn.root.status()
        self.conn.root.set_stdout(sys.stdout)
        #block until machine ready
        self.conn.root.prepare_workers()

    def close_remote_host(self):
        if self.conn is not None:
            self.conn.root.terminate_workers()
            self.conn.root.reset_stdout()
            self.conn.close()

    def get_analysis_target(self):
        try:
            p = Project.objects.filter(status=1,ready=1).earliest('created')
        except Project.DoesNotExist:
            return None
        return p

    def do_analysis(self, p):

        samples= p.sample_set.all()
        if samples is not None:
            # project in analyzing status
            p.status = Project.STATUS_OPTIONS[2][0]
            p.save()
            ab = self.conn.root
            for s in samples:
                # sample in analyzing status
                s.status = Project.STATUS_OPTIONS[2][0]
                s.save()
                # update local status
                self.status = [p.id, s.id, 0]
                try:
                    key = str("s3:"+s.filename)
                    # Start analysis sample's3:raw_data/2064_g1.fasta.gz'
                    job_id = ab.run_igblast(infile = key)
                except Exception,e:
                    s.status = Project.STATUS_OPTIONS[4][0]
                    s.save()
                    continue

                while True:
                    pro = ab.check_progress(job_id)
                    if len(pro) == 1 and pro[0][0] == u'SUCCESS':
                        print "progress bar 100%"
                        s.status = Project.STATUS_OPTIONS[3][0]
                        self.status[2] = 100
                        s.save()
                        break
                    else:
                        print "progress bar " + str(int(float(pro[1][1])/float(pro[0][1]+pro[1][1])*100)) + "%"
                        self.status[2] = int(float(pro[1][1])/float(pro[0][1]+pro[1][1])*100)
                    # sleep a while before next check
                    time.sleep(self.SLEEP_TIME)

            # all sample finished, determine project analyze result
            p.status = Project.STATUS_OPTIONS[3][0]
            for s in samples:
                if s.status == Project.STATUS_OPTIONS[4][0]:
                    p.status = Project.STATUS_OPTIONS[4][0]
            p.save()

    def get_status(self):
        return self.status

    def run(self):
        self.setup_remote_host()
        while not self.stop:
            target = self.get_analysis_target()
            if target is not None:
                self.do_analysis(target)
            time.sleep(self.SLEEP_TIME)
        self.close_remote_host()

    def stop(self):
        self.stop = True


class Command(BaseCommand):
    def handle(self, *args, **options):
        thread = Analysis()
        thread.start()

