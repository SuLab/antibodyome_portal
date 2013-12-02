from django.core.management.base import BaseCommand, CommandError
from django.db import models
#from placeholders import *
import os
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
        #print int(args[0])

