build.scan:
	go build -o bin/gmus.scan ./cmd/gmus.scan
build.migrate:
	go build -o bin/gmus.migrate ./cmd/gmus.migrate
build.server:
	go build -o bin/gmus.server ./cmd/gmus.server

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
	go run ./cmd/gmus.migrate
migrate.make:
	migrate create -ext sql -dir migrations -seq $(NAME)

run.scan:
	GO_ENV=development go run ./cmd/gmus.scan
run.server:
	GO_ENV=development go run ./cmd/gmus.server
