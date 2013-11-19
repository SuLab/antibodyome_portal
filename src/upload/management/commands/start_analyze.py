from django.core.management.base import BaseCommand
#from placeholders import *

from upload.analysis import Analysis

class Command(BaseCommand):
    def handle(self, *args, **options):
        thread1 = Analysis(1)
        thread1.start()

