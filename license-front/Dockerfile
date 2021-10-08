FROM node:14.16-alpine3.13 as builder
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm --registry https://registry.npm.taobao.org install
COPY . .
RUN npm run-script ng build -- --prod
FROM nginx:1.21.0-alpine as runner
COPY --from=builder /app/dist/license-front /usr/share/nginx/html
COPY ./nginx-backend.conf /etc/nginx/templates/default.conf.template
