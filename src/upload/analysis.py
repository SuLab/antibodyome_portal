import threading
from django.conf import settings 
#settings.configure()
import time
from rpyc.utils.ssh import SshContext
import rpyc
from models import Project,Sample


class Analysis(threading.Thread):
    def __init__(self, interval):
        '''
            "interval" is search time interval
        '''
        threading.Thread.__init__(self)
        self.interval = interval
        self.thread_stop = False
        self.progress = 0
 
    def run(self):        
        while not self.thread_stop:
            #Search the database and analysis sample here
            pqs = Project.objects.filter(status__lt=100).order_by("id")            
            if pqs:
                sshctx = SshContext("54.200.130.110", user = "ubuntu", keyfile = r"/root/rpc/jsetc_dev.pem")#modify the keyfile to your own keyfile path
                conn = rpyc.ssh_connect(sshctx, 18861,config={"allow_public_attrs": True})
                print conn.root.status()
                ab = conn.root
                ab.launch_workers()
                #print "start lanuch workers"
                #print "workers lanuching,please wait"
                while True:
                    sta = ab.check_workers()['spot_requests']
                    it = 0
                    for x in sta:
                        if x[1] != u'fulfilled':
                            break
                        else:
                            it = it + 1
                    if it == len(sta):
                        print "launch workers successful!"
                        break
                for p in pqs:
                    sqs = p.sample_set.filter(status__lt=100).order_by("id")
                    for s in sqs:
                        filekey = str("s3:"+s.filename)
                        #Start analysis sample
                        ab.run_igblast(infile=filekey)
                        #print "start analysis " + filekey
                        while True:
                            pro = ab.check_progress()
                            if len(pro) == 1 and pro[0][0] == u'SUCCESS':
                                print "progress bar 100%"
                                s.status = 100
                                self.progress = 100
                                break
                            else:
                                print "progress bar " + str(int(float(pro[1][1])/float(pro[0][1]+pro[1][1])*100)) + "%"
                                s.status = int(float(pro[1][1])/float(pro[0][1]+pro[1][1])*100)
                                self.progress = int(float(pro[1][1])/float(pro[0][1]+pro[1][1])*100)
                            #interval of check progress
                            time.sleep(self.interval)
                        s.save()
                    p.status = 100
                    p.save()
                ab.terminate_workers()
                print "terminate workers"
                #analysis time interval
                time.sleep(self.interval)
            #search database interval
            time.sleep(self.interval)

    def stop(self):
        self.thread_stop = True
    @staticmethod
    def checkProgress(self):
        return self.progress
        
'''
def test():
    thread1 = Analysis(1, 1)
    thread2 = Analysis(2, 2)
    thread1.start()
    thread2.start()
    time.sleep(10)
    thread1.stop()
    thread2.stop()
    return
 
if __name__ == '__main__':
    test()'''
