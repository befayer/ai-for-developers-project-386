---
name: verify
description: Verify generated artifacts, quality gates and production build.
---

# Verify

Run in order:

1. `npm run api:generate`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`
6. Build the Docker image and check `/api/v1/health` on a non-default `PORT` when Docker is available.
