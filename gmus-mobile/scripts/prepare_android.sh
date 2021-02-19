#!/bin/bash

set -e

cd "$(dirname $0)"

if [[ -z "$GMUS_ANDROID_KEYSTORE_FILE" ]]; then
  echo "Must set GMUS_ANDROID_KEYSTORE_FILE"
  exit 1
fi

if [[ -z "$GMUS_ANDROID_KEYSTORE_PASSWORD" ]]; then
  echo "Must set GMUS_ANDROID_KEYSTORE_PASSWORD"
  exit 1
fi

cat > ../android/key.properties << EOF
storePassword=$GMUS_ANDROID_KEYSTORE_PASSWORD
keyPassword=$GMUS_ANDROID_KEYSTORE_PASSWORD
keyAlias=key
storeFile=$GMUS_ANDROID_KEYSTORE_FILE
EOF

exit 0
