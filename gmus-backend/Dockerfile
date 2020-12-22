FROM golang:1.15-alpine

RUN apk update && apk add make gcc libc-dev libvorbis-dev libvorbis

RUN mkdir /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown appuser:appgroup /app
USER appuser
WORKDIR /app

COPY --chown=appuser:appgroup go.mod go.sum ./
RUN go mod download && go get -u github.com/onsi/ginkgo/ginkgo

COPY --chown=appuser:appgroup Makefile ci.env ./
COPY --chown=appuser:appgroup migrations ./migrations
COPY --chown=appuser:appgroup pkg ./pkg
COPY --chown=appuser:appgroup cmd ./cmd

RUN make clean && make build

ENV PATH="/app/bin:${PATH}"

CMD gmus.server
