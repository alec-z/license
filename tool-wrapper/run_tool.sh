#!/bin/bash
echo $1
dir=`date +%s`$RANDOM
echo $dir
mkdir -p /tmp/$dir/outputdir
cd /tmp/$dir
git clone -b $2 $1 inputdir
docker run -v /tmp/$dir/inputdir:/inputdir -v /tmp/$dir/outputdir:/outputdir  smartsyoung/compliance-zhangfei:v0.3 -n 2 -l --json-pp /outputdir/license.json /inputdir

