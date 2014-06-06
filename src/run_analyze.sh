#! /bin/bash
pid=./abome-analyze.pid
if [ -f $pid ]; then
    if kill -0 `cat $pid` > /dev/null 2>&1; then
        echo Analyze worker running as process `cat $pid`.  Stop it first.
        exit 1
    fi
fi

WORK_DIR=`dirname $0`
cd $WORK_DIR

nohup nice -n 0 python manage.py start_analyze > /dev/null 2>&1 < /dev/null &
echo Analyze worker running, pid: $!
echo $! > $pid
