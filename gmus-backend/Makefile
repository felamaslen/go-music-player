IMAGE := docker.fela.space/gmus-backend
TAG 	:= $$(git log -1 --pretty=%H)
IMG 	:= ${IMAGE}:${TAG}

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

build.docker:
	docker build -t ${IMG} .

push:
	docker push ${IMG}

get_image:
	@echo ${IMG}

clean:
	mkdir -p bin && rm -rf ./bin/*

fmt:
	@go fmt github.com/felamaslen/gmus-backend/...
lint:
	@test -z $(shell gofmt -l .) && echo "Lint ok" || (echo "Found formatting issues; run \"make fmt\" to fix"; exit 1)

test:
	GO_ENV=test ginkgo ./...
test.ci:
	GO_ENV=ci ginkgo --randomizeAllSpecs --randomizeSuites --failOnPending --cover --trace --race --progress --noColor ./...

migrate:
	go run ./cmd/gmus.migrate
migrate.make:
	migrate create -ext sql -dir migrations -seq $(NAME)

run.scan:
	GO_ENV=development go run ./cmd/gmus.scan
run.server:
	GO_ENV=development go run ./cmd/gmus.server
