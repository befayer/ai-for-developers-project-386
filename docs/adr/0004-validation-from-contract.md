# ADR-0004: request validation generated from the contract

Status: accepted — 2026-10-23

## Context

Mentor review found that the server rejected values the contract allowed: `durationMinutes: 45` (Zod required a multiple of 30, TypeSpec only 30–120) and an 81-character title (Zod `max(80)`, absent from TypeSpec). Invalid JSON returned Fastify's own `FST_ERR_CTP_INVALID_JSON_BODY` instead of an `ApiError` code.

Root cause: request rules lived in two hand-written places. Generated TypeScript types only say `string`/`number`, so lint, typecheck and build could not notice the drift, and tests used only valid values.

## Decision

- Every input constraint is declared in `api/main.tsp`. Durations are a closed set `30 | 60 | 90 | 120`, lengths have explicit `@maxLength`, ids use `@format("uuid")`.
- `npm run api:generate` writes `server/generated/schemas.ts` (dereferenced JSON Schemas from OpenAPI). Fastify validates bodies and query strings with them; hand-written Zod schemas are removed.
- A single error handler maps every framework client error to `400 VALIDATION_ERROR` in the `ApiError` shape.
- The same generated schemas drive form attributes (`maxLength`, duration options) in the UI.
- Boundary tests and a Playwright UI test are part of the definition of done (see `AGENTS.md`).

## Consequences

Changing a rule means editing TypeSpec and regenerating; server and form follow automatically. Rules not expressible in JSON Schema must be documented in the contract and tested explicitly.
