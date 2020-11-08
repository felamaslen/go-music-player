build:
	go build -o bin/scan ./cmd/scan

clean:
	mkdir -p bin && rm -rf ./bin/*

test.read:
	GO_ENV=test go test -v ./pkg/read

migrate:
	go run ./cmd/migrate

run.scan:
	go run ./cmd/scan
