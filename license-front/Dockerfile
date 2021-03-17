FROM node:alpine as builder
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm install
COPY . .
RUN npm run-script ng build -- --prod
FROM nginx:alpine as runner
COPY --from=builder /app/dist/license-front /usr/share/nginx/html
COPY ./nginx-backend.conf /etc/nginx/templates/default.conf.template
