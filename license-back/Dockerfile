FROM golang:alpine
WORKDIR /app
COPY ./go.mod .
RUN go env -w GOPROXY=https://goproxy.cn,direct && go mod download
COPY . .
CMD ["go", "run", "server.go"]