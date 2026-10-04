# ADR-0002: Booking conflicts are a server invariant

Status: accepted — 2026-10-01

## Decision

Create a booking inside an immediate SQLite transaction. Reject every stored interval that overlaps the requested interval, independent of event type. Keep a unique index on `start_at` as an additional guard for identical starts.

## Consequences

The UI may hide occupied slots for convenience, but direct and concurrent API requests are still protected. A conflict has the stable code `SLOT_CONFLICT` and HTTP status 409.

