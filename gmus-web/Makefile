NAME 	:= docker.fela.space/gmus-web
TAG 	:= $$(git log -1 --pretty=%H)
IMG 	:= ${NAME}:${TAG}

lint:
	yarn lint

test:
	yarn test

build.docker:
	docker build -t docker.fela.space/gmus-web-builder:latest --build-arg REACT_APP_API_URL=${REACT_APP_API_URL} -f builder.Dockerfile .
	docker build -t ${IMG} .

push:
	docker push ${IMG}

get_image:
	@echo ${IMG}
