SHA=$(git rev-parse main)
if [ -q $(git show main --name-status | grep license-front/) ]; then
  docker tag aleczheng/license-front "aleczheng/license-front:$SHA"
else
  echo 'buiding license-front'
  docker build -t aleczheng/license-front -t "aleczheng/license-front:$SHA" -f ./license-front/Dockerfile ./license-front
fi

if [ -q $(git show main --name-status | grep license-back/) ]; then
  docker tag aleczheng/license-back "aleczheng/license-back:$SHA"
else
  echo 'buiding license-back'
  docker build -t aleczheng/license-back -t aleczheng/license-back:$SHA -f ./license-back/Dockerfile ./license-back
fi


if [ -q $(git show main --name-status | grep tool-wrapper/) ] && [ -q $(git show main --name-status | grep scancode-toolkit/) ]; then
  docker tag aleczheng/tool-wrapper "aleczheng/tool-wrapper:$SHA"
else
  echo 'buiding tool-wrapper'
  cp -rf ./scancode-toolkit ./tool-wrapper 
  rm -rf ./tool-wrapper/scancode-toolkit/bin ./tool-wrapper/scancode-toolkit/lib
  docker build -t aleczheng/tool-wrapper -t "aleczheng/tool-wrapper:$SHA" -f ./tool-wrapper/Dockerfile ./tool-wrapper
  rm -rf ./tool-wrapper/scancode-toolkit
fi


docker push aleczheng/license-front:latest
docker push "aleczheng/license-front:$SHA"
docker push aleczheng/license-back:latest
docker push "aleczheng/license-back:$SHA"
docker push aleczheng/tool-wrapper:latest
docker push "aleczheng/tool-wrapper:$SHA"

