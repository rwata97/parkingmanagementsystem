# Coding Standards

These standards reflect the current project structure and configured tools. They do not add a formatter, linter, or other tooling requirement.

## General

- Use TypeScript for application code and keep types explicit at API and component boundaries.
- Prefer small, focused changes that follow the existing package and directory structure.
- Keep secrets and local environment files out of source control.
- Add or update tests when changing behavior, following the test patterns already present in that package.

## Frontend

- Build UI with React components and keep reusable UI under `src/components/`; the existing component organization uses `atoms`, `molecules`, `organisms`, and `pages`.
- Keep reusable API behavior in `src/hooks/` or `src/lib/` consistent with nearby code.
- Use React Query for server state patterns already established in the app.
- Keep MSW handlers aligned with the simulated frontend API behavior when changing mock-backed flows.
- Use Vitest and Testing Library for frontend tests. Run `npm run lint`, `npm run type-check`, and `npm run build` as applicable.

## Backend

- Organize custom application endpoints as Controller → Service → Model: controllers validate HTTP input and map responses, services implement use cases and authorization, and models own Drizzle-backed persistence.
- Keep Express composition, Better Auth integration, database connection setup, and shared HTTP middleware in infrastructure modules.
- Define API input and output contracts with Zod schemas and keep generated OpenAPI aligned with endpoint behavior.
- Return application errors using RFC 9457 Problem Details; do not expose internal exception details or raw validation-library output.
- Enforce authentication, resident ownership, and administrator permissions on the server. Client route guards are not authorization.
- Use the shared Drizzle migration history for both authentication and application tables. Review generated SQL and commit schema changes with their migrations.
- Run `npm test`, `npm run typecheck`, and `npm run build` as applicable.

See [ADR 0004](adr/0004-api-framework-and-contract.md) and [ADR 0005](adr/0005-backend-mvc-organization.md) for the API and backend organization decisions.
