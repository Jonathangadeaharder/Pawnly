# Highlight.io Local Setup

Self-hosted Highlight.io for local telemetry. No cloud account needed.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)

## Start

```bash
npm run highlight:start
```

Starts ClickHouse, Kafka, Redis, Postgres, and the Highlight backend. First run pulls images and may take a few minutes.

## Access Dashboard

Open `http://localhost:3000` in your browser after the backend is healthy.

## View Logs

```bash
npm run highlight:logs
```

## Stop

```bash
npm run highlight:stop
```

Stops all containers. Data persists in Docker volumes.

## Full Reset

```bash
docker compose -f docker-compose.highlight.yml down -v
```

Removes volumes — all telemetry data deleted.
