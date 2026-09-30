# AGENTS.md

## Project

Call Calendar is a React + Fastify service where a guest books one of the owner's event types. SQLite stores event types and bookings. TypeSpec is the API source of truth.

## Commands

- `npm install --legacy-peer-deps` — install dependencies (Node.js 22+).
- `npm run dev` — start API on `3000` and Vite on `5173`.
- `npm run api:generate` — regenerate OpenAPI, browser SDK and server types from TypeSpec.
- `npm run lint` — lint source and configuration.
- `npm run typecheck` — check client and server types.
- `npm test` — run integration tests.
- `npm run build` — regenerate the contract and build client/server.
- `docker build -t call-calendar .` — build the production image.

## Structure

- `api/` — TypeSpec source.
- `src/` — React UI and generated browser SDK.
- `server/` — Fastify API, SQLite repository and generated server types.
- `docs/` — specification, decisions, agent configuration and OpenAPI output.
- `.agents/skills/` — small repeatable engineering workflows.

## Working rules

1. Use Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`) and mention the related GitHub issue.
2. Change `api/main.tsp` before changing an API shape; then run `npm run api:generate`. Never edit generated files manually.
3. Keep booking availability and conflict checks on the server. UI filtering is not a security or consistency boundary.
4. Add or update an integration test for every booking rule.
5. Never commit tokens, credentials, `.env`, or SQLite data files.

## Skills

- `plan` — split a vertical feature from contract through tests.
- `tdd` — reproduce a rule with a failing test, implement, then refactor.
- `verify` — run generation, lint, typecheck, tests and build before completion.

Domain language lives in `CONTEXT.md`; architecture decisions live in `docs/adr/`.

