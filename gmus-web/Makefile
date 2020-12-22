NAME 	:= docker.fela.space/gmus-web
TAG 	:= $$(git log -1 --pretty=%H)
IMG 	:= ${NAME}:${TAG}

build.docker:
	docker build -t docker.fela.space/gmus-web-builder:latest -f builder.Dockerfile .
	docker build -t ${IMG} .

push:
	docker push ${IMG}

get_image:
	@echo ${IMG}
