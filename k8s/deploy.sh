#!/bin/bash

set -e

cd $(dirname "$0")

IMAGE_BACKEND=$(make -f ../gmus-backend/Makefile get_image)
IMAGE_WEB=$(make -f ../gmus-web/Makefile get_image)

namespace="gmus"

cat ./manifest.yml \
  | sed -e "s/docker\.fela\.space\/gmus-backend\:0/$(echo $IMAGE_BACKEND | sed -e 's/\//\\\//')/g" \
  | sed -e "s/docker\.fela\.space\/gmus-web\:0/$(echo $IMAGE_WEB | sed -e 's/\//\\\//')/g" \
  > ./manifest_with_image.yml

echo "Updating deployment..."
kubectl -n=$namespace apply -f ./manifest_with_image.yml

rm -f manifest_with_image.yml

exit 0
