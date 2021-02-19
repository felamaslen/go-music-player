#!/bin/bash

set -e

bundletool build-apks \
  --bundle=build/app/outputs/bundle/release/app-release.aab \
  --output=build/app/outputs/bundle/release/app-release.apks \
  --ks=${GMUS_ANDROID_KEYSTORE_FILE} \
  --ks-pass=pass:${GMUS_ANDROID_KEYSTORE_PASSWORD} \
  --ks-key-alias=key \
  --key-pass=pass:${GMUS_ANDROID_KEYSTORE_PASSWORD} \
  --overwrite

exit 0
