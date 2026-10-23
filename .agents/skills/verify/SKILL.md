---
name: verify
description: Verify generated artifacts, quality gates, the UI scenario and production build.
---

# Verify

Run in order:

1. `npm run api:generate` — then `git status`: generated files must not change unexpectedly.
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`
6. `npm run test:e2e` — books a meeting through the browser (type → slot → form → confirmation → owner list) and checks the conflict message. API tests alone do not catch broken forms.
7. Contract parity: for each changed endpoint compare `api/main.tsp`, the generated schema and the form attributes; send the first invalid value and malformed JSON with `curl` and check the response is an `ApiError` with a declared status.
8. Build the Docker image and check `/api/v1/health` on a non-default `PORT` when Docker is available.
