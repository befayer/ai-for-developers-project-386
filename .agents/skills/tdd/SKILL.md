---
name: tdd
description: Implement booking rules test-first at the server boundary.
---

# TDD

1. Add a failing Fastify injection test for observable API behaviour.
2. For every input constraint add boundary cases: the last valid and the first invalid value, plus malformed input (invalid JSON, wrong types). Assert the status code and the `ApiError.code` declared in the contract.
3. Implement the smallest contract/server/repository change.
4. Run the focused test, then the full suite.
5. Refactor only while all tests stay green.
