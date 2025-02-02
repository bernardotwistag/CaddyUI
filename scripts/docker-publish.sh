#!/bin/bash

# Get the version from package.json
VERSION=$(node -p "require('./package.json').version")
REGISTRY="ghcr.io"  # Replace with your registry
IMAGE_NAME="caddy-ui"    # Replace with your image name

# Build the Docker image
docker build -t $REGISTRY/$IMAGE_NAME:$VERSION .
docker tag $REGISTRY/$IMAGE_NAME:$VERSION $REGISTRY/$IMAGE_NAME:latest

# Push to registry
docker push $REGISTRY/$IMAGE_NAME:$VERSION
docker push $REGISTRY/$IMAGE_NAME:latest 