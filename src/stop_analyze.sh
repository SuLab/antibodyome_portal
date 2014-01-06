#! /bin/bash
file=abome-analyze.pid
if [ -f $file ]; then
    python manage.py release_analyze_host
    kill -9 `cat $file`
    rm $file
    echo Stopped analyze worker
else
    echo Analyze worker not running
fi
