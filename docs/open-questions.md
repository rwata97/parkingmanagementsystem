# Open Questions

This document tracks unresolved product, policy, and technical decisions needed for v1. It is separate from the [Future Enhancements / Product Roadmap](future-enhancements.md), which tracks proposed functionality outside v1. Questions here describe behavior and implementation within the agreed v1 scope.

## Accounts and data retention

- Which email delivery provider will send Better Auth password-reset messages, and what rate limits and abuse protections are required?
- What retention periods apply to personal data, raffle history, account-deletion tombstones, database backups, and logs?
- Which privacy and security obligations apply to resident and vehicle data?
- What documented operator procedure will bootstrap the initial administrator and any later administrator accounts?

## API contract details

- What endpoint-specific request and response schemas, validation rules, and success status codes should each route use?
- What default and maximum `limit` values should paginated endpoints use, and which list endpoints need sorting or filtering?
- What public problem types and stable error codes are needed beyond the agreed empty-raffle conflict?
- What is the final mapping between Better Auth operations and the frontend's existing mock-facing flows?
- How will Better Auth endpoints be represented in the generated OpenAPI document or a linked API reference?

## Cycle and inventory operations

- What mechanism will provision calendar cycles and enforce automatic registration close/expiry (scheduled worker, request-time transition, or both)?
- What is the initial spot inventory and its setup/seed procedure?
- What retention period applies to cycle action audits and raffle allocation records?

## Deployment and operations

- Which hosting provider and deployment regions will be used?
- What availability target, recovery time objective, and recovery point objective are required?
- Who owns monitoring, alerts, backups, restore drills, and operational support?
- What origin, cookie, CSRF, session-expiry, and secret-management settings fit the selected deployment topology?

## Decisions already recorded

V1 has open self-service signup without mandatory email verification, one server-controlled `ADMIN` or `RESIDENT` role per user, no resident approval roster, and resident account deletion that retains historical raffle references through a non-login tombstone. These are decisions, not open questions. Proposed approved-resident verification and other out-of-scope work are tracked in the roadmap.
