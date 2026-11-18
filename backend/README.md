# Backend

The backend is the Node.js/TypeScript REST API for the Community Parking Management System. It uses Express 5, express-zod-api with Zod 4, Better Auth, Drizzle ORM, and PostgreSQL, following [ADR 0001](../docs/adr/0001-technology-baseline.md), [ADR 0002](../docs/adr/0002-authentication-and-sessions.md), and [ADR 0004](../docs/adr/0004-api-framework-and-contract.md).

## Local setup

Requires Node.js 22 or newer and Docker Compose.

```sh
cd backend
npm ci
cp .env.example .env
```

Set `BETTER_AUTH_SECRET` in `.env` to a unique random value with at least 32 characters. Start the local PostgreSQL database and apply the committed migration:

```sh
docker compose up -d postgres
npm run db:migrate
npm run dev
```

The local compose service uses the development-only `parking` username and password and stores data in a named Docker volume. Production database hosting and credentials remain operational decisions; production should provide `DATABASE_URL` and secrets through its environment rather than use these local credentials.

## Environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `NODE_ENV` | Runtime mode | `development` |
| `PORT` | HTTP listen port | `4000` |
| `DATABASE_URL` | PostgreSQL connection URL | Local Compose URL in `.env.example` |
| `BETTER_AUTH_SECRET` | Better Auth signing/encryption secret | Required, minimum 32 characters |
| `BETTER_AUTH_URL` | Public backend origin | `http://localhost:4000` |
| `FRONTEND_ORIGIN` | Trusted browser origin for Better Auth | `http://localhost:5173` |

## Commands

```sh
npm run dev          # Start the API in watch mode
npm run build        # Compile to dist/
npm start            # Run the compiled API
npm run typecheck    # Type-check without emitting files
npm test             # Run backend foundation checks
npm run db:generate  # Generate a reviewed Drizzle migration from the schema
npm run db:migrate   # Apply committed Drizzle migrations
npm run db:check     # Check migration ordering
```

After changing the Drizzle schema, run `npm run db:generate`, review the generated SQL, and commit the migration. Apply it with `npm run db:migrate`. Do not use Better Auth's migration command or Drizzle `push` against the production schema; Better Auth tables and application tables share the Drizzle migration history.

## Foundation endpoints and boundaries

- `GET /api/v1/health` reports API and database readiness in its response body.
- `GET /api/v1/openapi.json` publishes the API definition generated from express-zod-api endpoint schemas.
- Better Auth handles email/password and server-managed sessions under `/api/v1/auth`. Its request handler is mounted before JSON body parsing.
- Credentialed CORS is limited to `FRONTEND_ORIGIN`; production should set this to the deployed browser origin.
- Application and Better Auth JSON errors are normalized to RFC 9457 Problem Details with `application/problem+json`. Application validation errors include safe `path`, `code`, and `message` entries.
- Drizzle owns the initial authentication and parking domain schema in a single migration history. The initial spot inventory is not seeded because its contents are still an open question.

## MVC organization

The frontend owns the View. Backend Controllers are express-zod-api endpoint definitions that validate HTTP input, invoke a Service, and return the established JSON contract. Services implement use cases and authorization; Models own Drizzle-backed data access. Express composition, Better Auth, and shared HTTP middleware remain infrastructure. The health endpoint demonstrates the Controller → Service → Model flow. See [ADR 0005](../docs/adr/0005-backend-mvc-organization.md).

This foundation does not yet implement resident reads, registration, account deletion, cycle provisioning or administration, or raffle execution. Those follow-up slices must use the session identity, authorization rules, and data flows recorded in the ADRs and architecture diagrams. The frontend's existing MSW behavior remains unchanged.
