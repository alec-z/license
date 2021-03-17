docker build -t aleczheng/license-front -t aleczheng/license-front:$SHA -f ./license-front/Dockerfile ./license-front
docker build -t aleczheng/license-back -t aleczheng/license-back:$SHA -f ./license-back/Dockerfile ./license-back

docker push aleczheng/license-front:latest
docker push aleczheng/license-front:$SHA
docker push aleczheng/license-back:latest
docker push aleczheng/license-back:$SHA
kubectl apply -f google_k8s

kubectl set image deployments/front front=aleczheng/license-front:$SHA
kubectl set image deployments/back back=aleczheng/license-backt:$SHA