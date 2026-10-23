---
name: plan
description: Plan a vertical Call Calendar change before implementation.
---

# Plan

1. Link the issue and specification story.
2. Identify contract, server, UI and test changes.
3. Declare dependencies and booking invariants at risk.
4. Build a constraint table for every input field the change touches:

   | Field | Type | Required | Length / range | Format / allowed values | TypeSpec | Server | Form |
   |---|---|---|---|---|---|---|---|

   Each constraint must appear in the TypeSpec column first; the server column is "generated schema" unless the rule is documented in the contract as non-schema. A rule from `docs/spec.md` that has no TypeSpec column entry is a gap — fix the contract before coding.
5. List the error responses (status + `ApiError.code`) each endpoint can return, including malformed input.
6. List boundary tests (last valid / first invalid value) and the UI scenario to verify.
7. Keep the slice independently demonstrable.
