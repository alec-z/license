SHA=$(git rev-parse HEAD)
docker build -t aleczheng/license-front -t aleczheng/license-front:$SHA -f ./license-front/Dockerfile ./license-front
docker build -t aleczheng/license-back -t aleczheng/license-back:$SHA -f ./license-back/Dockerfile ./license-back
docker build -t aleczheng/tool-wrapper -t aleczheng/tool-wrapper:$SHA -f ./tool-wrapper/Dockerfile ./tool-wrapper

docker push aleczheng/license-front:latest
docker push aleczheng/license-front:$SHA
docker push aleczheng/license-back:latest
docker push aleczheng/license-back:$SHA
docker push aleczheng/tool-wrapper:latest
docker push aleczheng/tool-wrapper:$SHA

kubectl apply -f google_k8s

kubectl set image deployments/front front=aleczheng/license-front:$SHA
kubectl set image deployments/back back=aleczheng/license-back:$SHA
kubectl set image deployments/wrapper wrapper=aleczheng/tool-wrapper:$SHA

