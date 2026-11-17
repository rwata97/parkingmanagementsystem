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

## References

- [React: Add React to an Existing Project](https://react.dev/learn/add-react-to-an-existing-project)
- [Node.js: Introduction to Node.js](https://nodejs.org/learn/getting-started/introduction-to-nodejs)
- [FastAPI documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL concurrency control](https://www.postgresql.org/docs/current/mvcc.html)
- [MySQL InnoDB transactions](https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html)
