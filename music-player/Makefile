build:
	go build -o bin/scan ./cmd/scan

clean:
	mkdir -p bin && rm -rf ./bin/*

test:
	GO_ENV=test go test -v ./...

migrate:
	go run ./cmd/migrate
migrate.make:
	migrate create -ext sql -dir migrations -seq $(NAME)

run.scan:
	go run ./cmd/scan
