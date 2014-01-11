from django.core.management.base import BaseCommand
from upload.threadTest import *


class Command(BaseCommand):
    def handle(self, *args, **options):
        #thread1 = Analysis(1)
        #thread1.start()
        try:
            interval = int(args[0])
        except ValueError:
            print "please input a valid number"
        else:
            thread1 = Analysis(interval)
            thread1.start()
