build:
	go build -o bin/scan ./cmd/scan

clean:
	mkdir -p bin && rm -rf ./bin/*

test:
	GO_ENV=test ginkgo ./...

migrate:
	go run ./cmd/migrate
migrate.make:
	migrate create -ext sql -dir migrations -seq $(NAME)

run.scan:
	go run ./cmd/scan
run.server:
	go run ./cmd/server
