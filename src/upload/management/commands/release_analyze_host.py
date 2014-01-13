from django.core.management.base import BaseCommand
from rpyc.utils.ssh import SshContext
import rpyc
from django.conf import settings


class Command(BaseCommand):
    def handle(self, *args, **options):
        sshctx = SshContext(**settings.RPYC_TUNNEL)
        conn = rpyc.ssh_connect(sshctx, settings.RPYC_PORT, config={"allow_public_attrs": True})
        #conn.root.set_stdout(sys.stdout)
        conn.root.terminate_workers()
