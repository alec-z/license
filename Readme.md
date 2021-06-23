## 开发环境搭建
1. 该系统的依赖有mysql, elasticsearch, 可以通过docker-compose -f dependency-docker-compose.yaml 通过docker拉起所有依赖
2. 准备数据库
3. 该系统分为前端（license-front)，后端(license-back)，和工具运行时(tool-wrapper) 总共3个进程。运行这3个进程需先进入相应的目录。
4. 启动工具运行时tool-wrapper： 该工具需要依赖mysql和elasticsearch,运行时需要设置MYSQL_HOST, MYSQL_PASSWORD 2个mysql相关的环境变量
(对于第一步拉起的docker中的mysql,其值为127.0.0.1和root)，还需要设置，ES_URL 这个elasticsearch相关的环境变量（对于第一步拉起的
elasticsearch，其值为http://127.0.0.1:9200）
5. 启动后端license-back, 需要设置环境变量MYSQL_HOST, MYSQL_PASSWORD
6. 启动前端license-front, 命令bash```
npm install

npm run-script ng serve -- --proxy-config=proxy.conf.json
'''
