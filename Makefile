.PHONY: start stop rebuild help

include .env
export

help:
	@echo ""
	@echo "==============================="
	@echo "  Volumen Makefile Commands"
	@echo "==============================="
	@echo "  make start                        - Build and start all services"
	@echo "  make stop                         - Stop all services"
	@echo "  make rebuild service=<n>          - Rebuild and restart a single service"
	@echo ""
	@echo "  Available service names:"
	@echo "    volumen-postgres"
	@echo "    volumen-ocr"
	@echo "    volumen-backend"
	@echo "    volumen-web"
	@echo "==============================="

start:
	docker compose up --build -d
	@echo "Waiting for postgres to be ready..."
	@until docker inspect -f '{{.State.Health.Status}}' volumen-postgres 2>/dev/null | grep -q "healthy"; do sleep 2; done
	@echo "Waiting for OCR service to be ready..."
	@until docker inspect -f '{{.State.Health.Status}}' volumen-ocr 2>/dev/null | grep -q "healthy"; do sleep 2; done
	@echo "Waiting for backend to be ready..."
	@until docker inspect -f '{{.State.Health.Status}}' volumen-backend 2>/dev/null | grep -q "healthy"; do sleep 2; done
	@echo "Waiting for web to be ready..."
	@until curl -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -q "200"; do sleep 2; done
	@echo ""
	@echo "==============================="
	@echo "  Volumen is running"
	@echo "==============================="
	@echo "  Web        : http://localhost:80"
	@echo "  Backend    : http://localhost:$(SERVER_PORT)"
	@echo "  OCR Engine : http://localhost:8000"
	@echo "==============================="
	@echo ""
	@echo "  Commands:"
	@echo "  make stop                         - Stop all services"
	@echo "  make rebuild service=<n>          - Rebuild and restart a single service"
	@echo ""
	@echo "  Available service names:"
	@echo "    volumen-postgres"
	@echo "    volumen-ocr"
	@echo "    volumen-backend"
	@echo "    volumen-web"
	@echo "==============================="

stop:
	docker compose down

rebuild:
	@if [ -z "$(service)" ]; then echo "Usage: make rebuild service=<service-name>"; exit 1; fi
	docker compose stop $(service)
	docker compose build $(service)
	docker compose start $(service)