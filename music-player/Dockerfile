FROM golang:1.15.3-alpine

RUN apk add make

WORKDIR /app
COPY . .

RUN make clean
RUN make build

CMD bin/music-player-scan
