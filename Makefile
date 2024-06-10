# Nitro Periphery API Makefile

IMAGE_NAME = nitro-intent-backend-api-image
.PHONY: build
docker-build:
	@docker build --no-cache -t $(IMAGE_NAME) .