# ADR-0001: Single-service architecture

Status: accepted — 2026-10-01

## Decision

Use one Fastify process for the API and the compiled React assets, with SQLite as the MVP datastore.

## Consequences

The project starts with one command and fits one Docker image. SQLite keeps local and review setup small. Horizontal scaling and durable free-tier hosting are intentionally outside the MVP; migration is isolated behind `server/repository.ts`.

