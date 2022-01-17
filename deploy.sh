#!/usr/bin/env bash
SHA=$(git rev-parse main)
kubectl apply -f google_k8s
kubectl set image deployments/front front=aleczheng/license-front:$SHA
//kubectl set image deployments/back back=aleczheng/license-back:$SHA
//kubectl set image deployments/wrapper wrapper=aleczheng/tool-wrapper:$SHA

