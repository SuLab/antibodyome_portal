from django.core.management.base import BaseCommand
from rpyc.utils.ssh import SshContext
import rpyc
from abome import settings


class Command(BaseCommand):
    def handle(self, *args, **options):
        sshctx = SshContext("54.200.130.110", user="ubuntu", keyfile=settings.SSH_KEY_PATH)
        conn = rpyc.ssh_connect(sshctx, 18861, config={"allow_public_attrs": True})
        #conn.root.set_stdout(sys.stdout)
        conn.root.terminate_workers()
