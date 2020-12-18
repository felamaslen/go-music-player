FROM golang:1.15-alpine

RUN apk update && apk add make gcc libc-dev libvorbis-dev

WORKDIR /app
COPY . .

RUN make clean
RUN make build

RUN apk del make gcc libc-dev libvorbis-dev && \
  apk update && apk add libvorbis

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV PATH="/app/bin:${PATH}"
