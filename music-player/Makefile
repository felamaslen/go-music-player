build:
	go build -o bin/scan ./cmd/scan

clean:
	mkdir -p bin && rm -rf ./bin/*

test:
	GO_ENV=test go test -v ./...

migrate:
	go run ./cmd/migrate

run.scan:
	go run ./cmd/scan
