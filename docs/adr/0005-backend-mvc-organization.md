# ADR 0005: Backend MVC Organization

- **Status:** Accepted
- **Date:** 2026-11-16

## Context

The backend uses Express 5 and express-zod-api, while the React application owns the browser interface. The architecture overview describes HTTP, authentication, application, and persistence layers, but does not define how application endpoints should be organized. The current backend foundation has API wiring and Drizzle tables, but no explicit controller and service boundaries.

The API needs a consistent structure so endpoint handlers stay focused on HTTP contracts while business behavior and database access remain reusable and independently testable. MVC is adapted to this client/server system: the View lives in the frontend, and the backend returns JSON rather than rendering templates.

## Decision

Organize custom backend capabilities using MVC with a service boundary:

- **View:** the React frontend renders the UI and consumes versioned JSON API responses. The backend does not render HTML views or templates.
- **Controller:** express-zod-api endpoint definitions validate HTTP input, invoke a service, and map its result to the existing response contract. Controllers do not contain domain policy or direct database queries.
- **Service:** plain TypeScript functions implement use cases and application authorization, coordinating models as needed.
- **Model:** Drizzle-backed schema and model functions own persistent data access and domain data representation.

Keep Express composition, Better Auth integration, database connection setup, and shared HTTP middleware in infrastructure modules. Better Auth continues to own authentication mechanics; application services remain responsible for parking-system authorization. Use plain modules and functions without a DI framework or generic repository abstraction.

## Consequences

- New application endpoints follow the request path Controller → Service → Model, then return through the Controller as JSON for the frontend View.
- Endpoint request/response schemas, paths, status codes, OpenAPI generation, and Problem Details behavior remain governed by ADR 0004.
- The existing health endpoint is the first MVC example; this decision does not add resident, cycle, registration, or raffle APIs.
- Models use the existing Drizzle schema and shared PostgreSQL client, so this organization change does not require a schema migration.
- Better Auth routes remain mounted through its Express integration rather than being reimplemented as application controllers.
