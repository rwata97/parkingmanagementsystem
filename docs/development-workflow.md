# Development Workflow

Run frontend and backend commands from their own package directories. The repository does not define root-level scripts or a configured CI workflow.

## Run the application

Start PostgreSQL and the backend as described in the [Onboarding Guide](onboarding.md), then start the frontend in another terminal. The frontend's MSW handlers currently simulate resident and raffle workflows; the backend foundation is independently available at `http://localhost:4000`.

## Make and validate changes

Use the package scripts that apply to the code you changed:

### Frontend (`frontend/`)

```sh
npm test
npm run lint
npm run type-check
npm run build
```

`npm test` starts Vitest using its default behavior. For a single non-watch coverage run, use `npm run test:coverage`.

### Backend (`backend/`)

```sh
npm test
npm run typecheck
npm run build
```

Backend `npm test` runs the foundation checks declared in the package script. There is no backend lint script currently configured.

## Database schema changes

When changing the Drizzle schema, work from `backend/`:

```sh
npm run db:generate
npm run db:check
npm run db:migrate
```

Review generated SQL before committing it. Commit the migration with the schema change. Apply committed migrations using `db:migrate`; authentication and application tables share the Drizzle migration history. Do not use Better Auth's migration command or Drizzle `push` against production.

## API and mock coordination

The API contract direction is documented in [ADR 0004](adr/0004-api-framework-and-contract.md): versioned `/api/v1` routes, Zod request/response schemas, generated OpenAPI, and RFC 9457 Problem Details for errors. When changing an endpoint contract, update its implementation and relevant frontend integrations or MSW handlers together. Preserve server-side authorization and the Controller → Service → Model boundary described in [ADR 0005](adr/0005-backend-mvc-organization.md).

## Before requesting review

Run relevant checks for the packages changed, inspect the diff, and include the commands and outcomes in the pull request description. For database changes, include the reviewed migration. See the [Contribution Guide](contributing.md) for branch and pull request conventions.
