build.backend:
	cd music-player && make build
build.frontend:
	cd gmus && yarn build

build:
	make build.backend
	make build.frontend

build.docker:
	cd gmus-backend && make build.docker
	cd gmus-web && make build.docker
	cd gmus-mobile && make build.docker

push:
	cd gmus-backend && make push
	cd gmus-web && make push

test.backend:
	cd gmus-backend && make test

test.frontend.web:
	cd gmus-web && yarn test

test.frontend.mobile:
	cd gmus-mobile && make test.flutter

test:
	make test.backend
	make test.frontend.web
	make test.frontend.mobile
