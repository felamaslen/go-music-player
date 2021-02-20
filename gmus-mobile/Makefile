NAME 	:= docker.fela.space/gmus-mobile
TAG 	:= $$(git log -1 --pretty=%H)
IMG 	:= ${NAME}:${TAG}

get_image:
	@echo ${IMG}

build.docker:
	docker build -t ${IMG} .

prepare.android:
	@./scripts/prepare_android.sh

build.android:
	@flutter build appbundle

bundle.android:
	@./scripts/bundle.sh

install.android:
	@bundletool install-apks --apks=build/app/outputs/bundle/release/app-release.apks

android-install:
	make prepare.android
	make build.android
	make bundle.android
	make install.android

run:
	flutter run

test.flutter:
	@flutter analyze
	@flutter test
