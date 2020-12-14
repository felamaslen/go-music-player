build.backend:
	cd music-player && make build
build.frontend:
	cd gmus && yarn build

build:
	make build.backend
	make build.frontend

test.backend:
	cd music-player && make test
test.frontend:
	cd gmus && yarn test

test:
	make test.backend
	make test.frontend
