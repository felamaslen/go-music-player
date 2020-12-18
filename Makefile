build.backend:
	cd music-player && make build
build.frontend:
	cd gmus && yarn build

build:
	make build.backend
	make build.frontend

test.backend:
	cd gmus-backend && make test

test.frontend.web:
	cd gmus-web && yarn test

test:
	make test.backend
	make test.frontend.web
