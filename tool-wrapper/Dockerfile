FROM golang:alpine as builder
WORKDIR /app
COPY ./go.mod .
RUN go mod download
COPY . .
ENV CGO_ENABLED=0
RUN go build

FROM python:3.6-slim-buster as runner

# Requirements as per https://scancode-toolkit.readthedocs.io/en/latest/getting-started/install.html
RUN apt-get update \
 && apt-get install -y --no-install-recommends bzip2 xz-utils zlib1g libxml2-dev libxslt1-dev libgomp1 libpopt0 git wget ca-certificates \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
 && mkdir -p /app

# Create directory for scancode sources
WORKDIR /tools


# Run scancode once for initial configuration, with --reindex-licenses to create the base license index
RUN wget -O scancode.tar.xz https://github.com/nexB/scancode-toolkit/releases/download/v21.3.31/scancode-toolkit-21.3.31_py36-linux.tar.xz \
 && xz -d scancode.tar.xz \
 && tar -xf scancode.tar \
 && ln -s ./scancode-toolkit-21.3.31/scancode ./scancode \
 && rm -f scancode.tar.xz scancode.tar

COPY --from=builder /app/tool-wrapper /app
# Set entrypoint to be the scancode command, allows to run the generated docker image directly with the scancode arguments: `docker run (...) <containername> <scancode arguments>`
CMD ["/app/tool-wrapper"]