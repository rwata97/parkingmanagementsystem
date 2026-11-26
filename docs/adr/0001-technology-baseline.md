# ADR 0001: Technology Baseline

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The Community Parking Management System needs a browser application for residents and administrators, a server API for account and raffle workflows, and persistent storage for residents, parking spots, raffle cycles, registrations, results, and assignments.

The frontend already exists as a React and TypeScript single-page application. The project has one developer, who has experience with TypeScript and no experience with Python. The data model is relational, and raffle execution must preserve assignment integrity when multiple records are written together.

This decision is based on a design-level comparison of candidate technologies. No benchmark or hands-on comparison was conducted.

## Decision

- Use **React with TypeScript** for the web application.
- Use **Node.js with TypeScript** for the REST API.
- Use **PostgreSQL** for persistent application data.

## Alternatives Considered

### Web application: React or Vue

Vue can support a full single-page application, so it is a viable alternative. The existing frontend is already implemented in React and TypeScript, and the developer is familiar with TypeScript. Replacing the current frontend would add migration work without a stated product requirement that calls for Vue. React is therefore retained.

### REST API: Node.js/TypeScript or Python/FastAPI

Python/FastAPI is a viable API option with typed request handling and generated API documentation. The developer has no Python experience, while the existing frontend and the developer's experience are both in TypeScript. Node.js/TypeScript keeps the API within the team's current language skills and avoids introducing another language and runtime.

### Database: PostgreSQL or MySQL

Both PostgreSQL and MySQL can support relational constraints and transactions. PostgreSQL is selected because it fits the system's relational integrity and transactional needs for raffle assignments. The project does not require a PostgreSQL-only feature; MySQL remains a viable alternative if future operational or hosting constraints favor it.

## Consequences

- The existing React frontend can continue without a framework migration.
- The web application and API use TypeScript, matching the sole developer's current experience.
- PostgreSQL will be used to enforce relational integrity and to persist grouped raffle updates transactionally.
- Hosting, deployment topology, and database operations remain to be selected separately.
- Authentication and session implementation details remain in ADR 0002.
- Raffle lifecycle, allocation policy, and transaction behavior are recorded in ADR 0003.

## Decision Addendum — PostgreSQL Schema and Migrations (2026-11-11)

Use **Drizzle ORM** for typed PostgreSQL schema definitions and versioned SQL migrations. Keep Better Auth's generated schema and application tables in one Drizzle-managed migration workflow. Generate migrations from the schema, review the SQL, commit migration files, and apply them through the deployment process; do not let separate tools independently mutate the production schema.

The v1 domain schema preserves the mock's identity relationship: the Better Auth user ID is the resident ID used by registrations and assignments. Use one optional vehicle per user, represented by a related table with a unique user reference. Add a `deletedAt` marker to retain account tombstones without allowing sign-in. Keep raffle cycles, registrations, results, assignments, and spot state in PostgreSQL with foreign keys and uniqueness constraints. Detailed raffle and account lifecycle behavior is recorded in ADRs 0002 and 0003.

### Rationale and consequences

- Drizzle keeps schema definitions and migration generation in the project's TypeScript toolchain and supports the selected Better Auth adapter.
- A single migration history avoids drift between authentication and application tables.
- Account deletion must preserve the user identifier referenced by raffle history; ADR 0002 defines the non-login tombstone behavior.
- Hosting, deployment topology, backup policy, and broader data retention remain operational decisions.

### Alternatives considered

- **Prisma ORM:** a viable typed schema and migration tool with a Better Auth adapter, but it would introduce a different ORM workflow.
- **Handwritten SQL migrations:** provide direct control but require maintaining schema definitions and application types separately.
- **Separate Better Auth and application migration tools:** rejected for v1 because they create competing schema histories.

### References

- [Better Auth: Drizzle adapter](https://better-auth.com/docs/adapters/drizzle)
- [Drizzle ORM: Migrations](https://orm.drizzle.team/docs/migrations)

## Decision Addendum — Frontend Architecture and Testing (2026-11-26)

### Decisions

- Use **TanStack React Query** for API-backed server state: fetching, caching, mutations, and invalidating dependent queries. It is not the general-purpose store for transient client or presentation state.
- Use **Mock Service Worker (MSW)** as a browser-side API simulator during frontend development. It is not the production API and is not the configured Vitest test server. Current frontend tests mock API functions directly.
- Keep the frontend's adapted **Atomic Design** hierarchy under `frontend/src/components/`: `atoms/`, `molecules/`, `organisms/`, and `pages/`. Keep authentication-specific components in `auth/`; use the categories pragmatically rather than forcing every component into one.
- Separate state by responsibility: TanStack Query owns remote API data; the auth context exposes the current user derived from the auth query; React component state owns transient form and UI state. No global client-state library is required without a concrete need. Zustand is present as a dependency but is not currently used.
- Use **Vitest and Testing Library** for frontend tests, with direct API-function mocks as the current pattern. Use Node's built-in test runner for backend tests. As backend capabilities mature, add PostgreSQL integration coverage and end-to-end checks for critical user workflows. No numeric coverage threshold or end-to-end test framework is selected by this decision.
- Organize frontend code by responsibility: `src/app/` for app routing, `src/components/` for UI, `src/hooks/` for reusable hooks, and `src/lib/` for shared utilities. Keep browser MSW setup and handlers in `frontend/msw/`, mock fixtures in `frontend/_mocks_/`, and tests alongside the relevant source files in `src/`. Backend organization remains governed by [ADR 0005](0005-backend-mvc-organization.md).

### Rationale and consequences

- TanStack Query is already used across auth, raffle, resident, and spot hooks; mutations invalidate queries whose data may have changed.
- The existing browser MSW worker starts in development mode, while Vitest tests mock API functions. Keeping these roles explicit avoids treating simulated browser behavior as production behavior or test coverage.
- The existing component hierarchy supports reuse from small controls through composed screens. The `pages/` and `auth/` folders adapt the pattern to the application's route and authentication needs.
- This decision documents current frontend organization and testing direction; it does not require a directory reorganization, a new state library, or a new test tool.

### Alternatives considered

- A single global client-state store could hold both API and UI state, but would duplicate the caching and synchronization responsibilities already handled by TanStack Query.
- Running MSW as the standard frontend test server could provide request-level scenarios; the current tests instead mock API functions directly, and adopting MSW for tests is not part of this decision.
- A feature-first component layout is possible, but the existing reusable component tiers are retained for now.

## References

- [React: Add React to an Existing Project](https://react.dev/learn/add-react-to-an-existing-project)
- [Node.js: Introduction to Node.js](https://nodejs.org/learn/getting-started/introduction-to-nodejs)
- [FastAPI documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL concurrency control](https://www.postgresql.org/docs/current/mvcc.html)
- [MySQL InnoDB transactions](https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html)
