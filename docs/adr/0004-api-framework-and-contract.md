# ADR 0004: API Framework and Contract

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The Community Parking Management System needs a Node.js/TypeScript REST API to support resident and administrator workflows. The frontend currently calls mock routes under `/api`, but there is no production API implementation or formal API contract in the repository.

ADR 0002 selects Better Auth for email/password authentication and server-managed sessions. This ADR selects the compatible API framework and contract layer. The API must enforce resident ownership and administrator permissions on protected operations; authentication middleware does not replace application-level authorization.

The frontend already uses TypeScript and Zod 4. A code-first contract strategy can validate requests and responses at runtime while generating OpenAPI documentation from endpoint schemas.

## Decision

Use **Express 5** as the Node.js API framework. It has a documented Better Auth integration and fits the project's TypeScript direction.

Use **express-zod-api** as the Express route and contract layer. Define endpoint inputs and outputs with Zod 4 schemas, validate them at runtime, and generate OpenAPI documentation from those definitions.

The application API remains responsible for resident ownership and administrator authorization checks on every protected operation. Better Auth authenticates users and manages sessions; it does not determine parking-system access policy.

## Alternatives Considered

### Hono

Hono provides TypeScript support, code-first OpenAPI options, and a direct Better Auth integration. It is a viable alternative, but Express was selected to align with the requested Express-compatible authentication integration and the documented Better Auth Express handler.

### Fastify

Fastify provides route schemas for validation and serialization, with OpenAPI generation available through its plugin ecosystem. It is a viable Node-focused alternative, but would require verifying and wiring a compatible Better Auth integration.

### Plain Express with separate Zod and OpenAPI tooling

Plain Express could use Zod middleware for runtime validation and a separate generator such as `@asteasolutions/zod-to-openapi`. This offers flexibility, but requires more route and schema wiring than the selected express-zod-api layer.

## Consequences

- Endpoint schemas will define runtime input/output validation and generate the OpenAPI contract, reducing drift between implementation and documentation.
- express-zod-api adds a more opinionated route layer on top of Express; maintainers must follow its endpoint and middleware conventions.
- Better Auth must be mounted in the correct Express middleware order, before body parsing where required. This integration must be verified during backend implementation.
- The API framework does not change the requirement for server-side authorization checks in application logic.

## Decision Addendum — V1 API Conventions (2026-11-11)

- Prefix production routes with `/api/v1`, including Better Auth routes under `/api/v1/auth`.
- Return API errors using RFC 9457 Problem Details (`application/problem+json`) for application-owned routes and Better Auth routes. Normalize library errors to the shared format without exposing implementation details.
- Include a structured `errors` extension for validation failures. Each entry contains a field path, stable public error code, and safe message; do not expose raw Zod issue objects as the public contract.
- Reject a raffle run for a cycle with no registrations using `409 Conflict` and a stable problem type/code. Do not create a raffle result.
- Paginated list endpoints use `limit` and `offset` query parameters and return `{ items, total, limit, offset }`.
- Serve the generated OpenAPI document at `GET /api/v1/openapi.json`.

Endpoint-specific request and response schemas, pagination defaults and caps, and other domain status mappings remain API contract work. Better Auth must be mounted at the versioned base path before request body parsing; verify the Express 5 wildcard route and error normalization during implementation.

## Details Deferred

- The endpoint-specific request and response schemas.
- Pagination defaults and maximum limits.
- Status-code mappings and public problem types/codes beyond the agreed empty-raffle conflict.
- How Better Auth operations will be represented in the generated OpenAPI document or an associated API reference.

## References

- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [Better Auth: Express integration](https://better-auth.com/docs/integrations/express)
- [express-zod-api](https://github.com/RobinTail/express-zod-api)
- [Fastify: Validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)
- [Hono: Zod OpenAPI](https://hono.dev/examples/zod-openapi)
- [Zod to OpenAPI](https://github.com/asteasolutions/zod-to-openapi)
