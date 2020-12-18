build.scan:
	go build -o bin/scan ./cmd/scan
build.migrate:
	go build -o bin/migrate ./cmd/migrate
build.server:
	go build -o bin/server ./cmd/server

build:
	make build.scan
	make build.migrate
	make build.server

clean:
	mkdir -p bin && rm -rf ./bin/*

fmt:
	go fmt github.com/felamaslen/gmus-backend/...

test:
	GO_ENV=test ginkgo ./...

migrate:
	go run ./cmd/migrate
migrate.make:
	migrate create -ext sql -dir migrations -seq $(NAME)

run.scan:
	GO_ENV=development go run ./cmd/scan
run.server:
	GO_ENV=development go run ./cmd/server
