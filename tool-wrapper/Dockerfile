FROM golang:alpine as builder
WORKDIR /app
COPY ./go.mod .
RUN go env -w GOPROXY=goproxy.cn,direct && go mod download
COPY . .
ENV CGO_ENABLED=0
RUN go build

FROM python:3.6-slim-buster as runner

# Requirements as per https://scancode-toolkit.readthedocs.io/en/latest/getting-started/install.html
RUN sed -i s@/deb.debian.org/@/mirrors.aliyun.com/@g /etc/apt/sources.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends bzip2 xz-utils zlib1g libxml2-dev libxslt1-dev libgomp1 libpopt0 git ca-certificates gcc \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
 && mkdir -p /app

COPY --from=builder /app/tool-wrapper /app

# Create directory for scancode sources
RUN mkdir -p /tools/scancode-toolkit

# Copy sources into docker container
COPY ./scancode-toolkit /tools/scancode-toolkit

# Set workdir

# Run scancode once for initial configuration, with --reindex-licenses to create the base license index
ENV PYPI_LINKS=https://pypi.doubanio.com/simple/

RUN cd /tools/scancode-toolkit && ./scancode --reindex-licenses && ln -s /tools/scancode-toolkit/scancode /tools/scancode


# Add scancode to path
ENV PATH=/tools/scancode-toolkit/scancode-toolkit:$PATH

# Set entrypoint to be the scancode command, allows to run the generated docker image directly with the scancode arguments: `docker run (...) <containername> <scancode arguments>`
CMD ["/app/tool-wrapper"]