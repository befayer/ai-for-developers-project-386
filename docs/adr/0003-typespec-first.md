# ADR-0003: TypeSpec-first API contract

Status: accepted — 2026-10-01

## Decision

`api/main.tsp` is the only manually edited API schema. One generation command emits OpenAPI, the browser client and server-side TypeScript types.

## Consequences

Contract changes are reviewed in TypeSpec first. Generated output is committed for traceability but never edited manually. React uses the generated SDK instead of parallel handwritten `fetch` calls.

