# Community Parking Management System — Architecture Overview

**Status:** Draft for review
**Perspective:** Pre-project design
**Audience:** Project sponsors, community administrators, product and engineering teams, and operations

## 1. Purpose and design basis

This document describes the proposed architecture for a residential parking management system that allocates parking spots through quarterly raffles. It treats the system as a whole: browser application, API, persistence, security, deployment, and operations.

The design is grounded in the existing product workflows and frontend behavior: resident registration and sign-in, raffle enrollment, current assignment and history, and administrator views and raffle execution. The frontend currently uses MSW and seeded browser-side mock data to simulate API behavior. Those mocks inform the proposed API capabilities; they are not the production service or source of truth.

The accepted production direction is a React/TypeScript single-page application, an Express 5 REST API using Node.js and TypeScript, and PostgreSQL. The API uses Better Auth for email/password authentication and server-managed sessions, and express-zod-api with Zod 4 for runtime endpoint validation and OpenAPI generation. Drizzle ORM owns the PostgreSQL schema and versioned migrations, including Better Auth tables. The API uses PostgreSQL transactions, cycle-row locking, and assignment constraints to protect raffle execution. See [ADR 0001](adr/0001-technology-baseline.md), [ADR 0002](adr/0002-authentication-and-sessions.md), [ADR 0003](adr/0003-raffle-execution-integrity.md), and [ADR 0004](adr/0004-api-framework-and-contract.md) for the decisions and alternatives. This document expands the technical direction in the Project Initiation Document (`docs/project-initiation.md`) and should be read with it.

## 2. System context and scope

Anyone may create a resident account and sign in without administrator approval or mandatory email verification. A resident can register once for an open cycle, review assignments and history, or request account deletion. Administrators review residents, spots, and prior raffles; start provisioned cycles; close or reopen registration before the deadline; and manually run a closed cycle.

The system manages account and optional vehicle details, preloaded spot inventory and status, cycle registration, raffle results, and assignments. It does not provide an approved-resident roster, administrator-managed resident eligibility, spot inventory/status editing, result correction, payments, physical facility access, or occupancy monitoring in v1.

The [C4 system context diagram](diagrams/system-context.md) shows the system boundary and its two user roles. It treats the browser application, API, and database as parts of the system and omits external services that have not yet been selected, including the email provider for password recovery.

The [C4 container diagram](diagrams/container-diagram.md) expands the system boundary to show the proposed web application, REST API, and PostgreSQL database, along with their relationships.

The [data-flow diagrams](diagrams/data-flows.md) show account/session, password-reset, account-deletion, resident-read, raffle-registration, cycle-lifecycle, admin-read, and raffle-execution sequences, including where MSW behavior differs from production intent.

Open requirements and design questions are tracked separately in [open-questions.md](open-questions.md).

Proposed functionality outside v1 is tracked in the [Future Enhancements / Product Roadmap](future-enhancements.md). Roadmap entries do not authorize implementation.

MSW is a browser-side frontend development aid. Current frontend tests mock API functions directly. In production, the API is authoritative for identity, permissions, raffle eligibility, and all persistent business data.

## 3. Architecture components and responsibilities

| Component | Responsibility | Proposed design |
|---|---|---|
| Web application | Resident and administrator user experience; route selection; form interaction; loading, success, and error feedback | Existing React and TypeScript SPA built with Vite and React Router; TanStack Query manages remote state; shared hooks call a common fetch helper. Client route guards improve navigation but do not replace API authorization. |
| REST API | Validate requests, authenticate users, authorize operations, apply domain rules, and coordinate persistence | Express 5 on Node.js/TypeScript with express-zod-api, organized using MVC with a service boundary. The React frontend owns the View; backend Controllers validate/map JSON contracts, Services implement use cases, and Drizzle-backed Models own persistence. Better Auth handles email/password authentication and sessions. |
| PostgreSQL | Durable source of truth and integrity across auth records, users, vehicles, spots, raffle cycles, registrations, results, assignments, and cycle audit | Stores Better Auth user, account, verification, and session data alongside app-managed roles and domain data. Drizzle schema definitions and reviewed versioned migrations manage all tables in one workflow. Foreign keys, uniqueness constraints, and transactions protect relationships and assignment rules. |
| MSW and mock data | Simulate API responses during browser-based frontend development | Retain as a development boundary; current frontend tests mock API functions directly. Do not use browser storage or mock state as production persistence. |
| Delivery and operations | Build, deploy, configure, observe, back up, and recover the service | CI/CD, separate environment configuration, managed or hosted PostgreSQL, secret management, health and error monitoring, backups, and documented restore procedures. |

### 3.1 MVC organization and request flow

The frontend is the View: it renders screens and consumes the backend's versioned JSON contracts. The backend does not render HTML or templates. Custom API requests flow through these responsibilities:

1. **Controller:** express-zod-api endpoints under `/api/v1` validate request and response schemas, call a service, and map the result to the public JSON contract. They do not contain domain rules or query Drizzle directly.
2. **Service:** plain TypeScript functions implement application use cases and authorization, coordinating models as needed.
3. **Model:** Drizzle-backed schema and model functions represent application data and own PostgreSQL access, constraints, and transaction participation.
4. **View:** the React frontend consumes the JSON response and presents it to residents and administrators.

Express composition, Better Auth, the PostgreSQL client, and shared Problem Details/CORS middleware remain infrastructure concerns. Better Auth resolves sessions; application services enforce parking-system roles and ownership. This MVC organization is recorded in [ADR 0005](adr/0005-backend-mvc-organization.md); API contracts remain governed by [ADR 0004](adr/0004-api-framework-and-contract.md).

## 4. Key workflows and data flow

### Resident account and session

1. A person submits name, email, password, and optional single-vehicle details through the web application to Better Auth's email/password flow.
2. Better Auth validates credentials and stores authentication records and password hashes in PostgreSQL. The server assigns every public signup the `RESIDENT` role; email verification is not required in v1.
3. Better Auth creates a server-managed session and returns the supported user profile. The Better Auth user ID is the resident ID used by vehicle, registration, and assignment records.
4. The browser sends the session cookie on subsequent API calls. On reload, the frontend requests the current user to restore its authenticated view.
5. Sign-out revokes the server session and clears the browser's session cookie.

The current MSW mock represents registration, login, current-user, logout, and password-reset flows with hand-written handlers. It is not the production authentication implementation. Better Auth provides the production authentication routes. V1 follows the mock by allowing open signup without mandatory email verification; only the password-reset email provider remains unselected. Administrator accounts are created through controlled setup, not public signup or an admin-management screen.

### Resident account deletion

1. An authenticated resident requests account deletion and re-enters their password.
2. The API revokes sessions, removes credential/account and vehicle data, redacts the name, and replaces the required email field with a unique non-deliverable placeholder.
3. Keep the same user ID as a non-login tombstone so historical registrations and assignments remain linked. Replace the required email value with a unique non-deliverable placeholder, mark the profile deleted, and ensure sign-in rejects it. Better Auth's hard-delete operation is not used. An existing assignment remains in effect through that cycle.

### Raffle registration

1. An authenticated resident views the upcoming target-quarter cycle and registration state.
2. The frontend submits a registration request; the API derives the resident identity from the authenticated session rather than trusting a client-supplied resident ID.
3. The API confirms the account has the `RESIDENT` role, the cycle is open, and the user has not already registered, then persists the registration.
4. The frontend refreshes current raffle and history-related data and shows the outcome.

The current mock endpoint accepts a resident identifier in the request body. Production derives it from the session; the database relationship remains user ID to registration ID as in the mock.

### Cycle lifecycle

The system provisions a cycle for the upcoming target quarter. An administrator starts the cycle to open registration. Registration closes automatically at the target quarter boundary in `America/Mexico_City`; an administrator may close early and reopen before that deadline. An unstarted cycle expires at the deadline. Start, close, reopen, and run actions are recorded with actor, action, timestamp, and optional reason. Raffle execution remains a manual administrator action after close.

### Administrator raffle execution

1. The dashboard displays the provisioned cycle and allows an administrator to start it, close/reopen registration before the deadline, or run it after close.
2. The API confirms administrator permission and locks the cycle row before execution. If the cycle already completed, a retry returns its stored result. If it has no registrations, the API returns `409 Conflict` and creates no result.
3. In one PostgreSQL transaction, the API orders previous-cycle non-winners before previous-cycle recipients, randomly shuffles each group with an unbiased cryptographic source, assigns available spots, records outcomes, releases prior assigned spots, and updates spot state. Constraints prevent duplicate assignments for a resident or spot in that cycle.
4. The API commits and returns the result; the frontend refreshes cycle, raffle history, resident history, and spot data. A failed write rolls back the result, assignments, and spot updates together.

If any write fails, the transaction rolls back the result, assignments, and spot updates together. Empty cycles stay closed and uncompleted. V1 does not support corrections or reruns. Unassigned registrants are shown as not selected in the app; no email result notifications are sent.

## 5. API capability map

The following capability groups reflect current frontend calls and mock handlers. They are an architectural inventory, not the final production route contract. Production routes use `/api/v1`; Better Auth is mounted under `/api/v1/auth`. express-zod-api definitions validate endpoint inputs and outputs with Zod 4 and generate OpenAPI. Errors use RFC 9457 Problem Details, lists use `limit`/`offset` and `{ items, total, limit, offset }`, and OpenAPI is served at `/api/v1/openapi.json`. Endpoint-specific payload schemas, pagination defaults, and how Better Auth endpoints appear in the published API reference remain contract work.

| Capability | Current mock-facing route(s) | Access intent |
|---|---|---|
| Account and session | Mock: `/api/auth/*`; production: Better Auth under `/api/v1/auth/*` | Signup and login are public; signup assigns `RESIDENT`. Current-user and logout require a session. |
| Account deletion | Application endpoint under `/api/v1` (exact route is contract work) | Authenticated resident; password re-entry; redact account data and preserve a non-login user ID tombstone. |
| Password recovery | Mock: `/api/auth/password/reset/*`; production: Better Auth under `/api/v1/auth/*` | Public entry points with non-disclosing responses; email delivery provider remains open. |
| Current raffle and enrollment | `GET /api/v1/raffles/current`, `POST /api/v1/raffles/register` | Authenticated resident; identity comes from the session, and registration requires an open cycle. |
| Resident history | `GET /api/v1/resident/raffle-history` | Authenticated resident; return history for the session's identity. |
| Spot inventory | `GET /api/v1/spots` | Authenticated access; v1 has no inventory edit controls. |
| Resident administration | `GET /api/v1/residents` | Administrator-only read-only resident account view. |
| Cycle administration | `/api/v1/admin/cycles/*` | Administrator-only start, early close, reopen-before-deadline, and manual execution actions; each action is audited. |
| Raffle administration | `GET /api/v1/admin/raffles`, `GET /api/v1/admin/raffles/:id` | Administrator-only result history and details. |

The current fetch helper surfaces a response `message`; update it to handle Problem Details fields and structured validation errors. Better Auth and application errors must be normalized to the same public format.

## 6. Domain model and persistence

The core persisted concepts are:

- **User/resident:** Better Auth owns the user, account, verification, and session records. The application stores one server-controlled `ADMIN` or `RESIDENT` role on the user and a `deletedAt` marker for account tombstones. A public signup always creates a resident; administrator creation is controlled setup. No separate resident roster/table is used in v1.
- **Vehicle:** zero or one vehicle per user, stored in a related one-to-one table with type and plate. Account deletion removes vehicle details.
- **Parking spot:** stable identifier, current resident reference, and stored status `available`, `assigned`, `reserved`, or `maintenance`. Inventory is preloaded; no v1 editing UI.
- **Raffle cycle:** target quarter, fixed deadline, lifecycle state (`scheduled`, `registration_open`, `registration_closed`, `completed`, or `expired`), and action audit records.
- **Registration:** user-to-cycle participation with a uniqueness rule preventing duplicate enrollment for the same cycle.
- **Raffle result:** cycle, execution time, and auditable outcome.
- **Assignment:** cycle, user, spot, and assignment time; constraints prevent one user or spot from having multiple assignments in a cycle.

Foreign keys preserve relationships. Database constraints should enforce invariants that must hold even when requests overlap. Raffle result creation, assignments, and spot status changes belong in one transaction. Historical records must remain queryable after later cycles are run; current spot state alone is not a substitute for assignment history.

Drizzle schema definitions and reviewed versioned SQL migrations manage Better Auth and application tables together. Account deletion removes credentials, sessions, and vehicle data, replaces required profile fields with non-deliverable placeholders, and preserves the user ID as a non-login tombstone for raffle history. Broader retention duration remains open.

## 7. Security and privacy

- Hash passwords with a modern password-hashing function; never store plaintext credentials.
- Use server-managed sessions with an `HttpOnly`, `Secure` cookie in production and an appropriate `SameSite` policy. Protect state-changing requests against cross-site request forgery where required by the chosen session/cookie design.
- Enforce authorization in the API on every protected operation. Residents may only access their own enrollment and history; administrators may access administrative data and execute raffles.
- Validate and normalize all input at the server boundary. Do not trust client-provided roles, resident identity, cycle eligibility, spot availability, or raffle results.
- Protect sensitive resident and vehicle data through least-privilege access, secure transport, careful logging, and a retention policy.
- Keep secrets out of source control and browser bundles. Configure them separately for development, test, and production.
- Add rate limiting and abuse protections to authentication and password recovery endpoints. Password recovery uses email; the delivery provider remains to be selected.
- Account creation does not require email verification in v1. Email ownership verification and approved-resident verification are separate future proposals.

## 8. Raffle rules and unresolved policy decisions

V1 applies the accepted policy: any resident-role account may register once while a cycle is open; prior-cycle non-winners receive priority; ties are cryptographically shuffled; available spots are assigned until exhausted; oversubscribed residents are recorded as not selected; and empty cycles cannot be run. Results are shown in-app. There is no v1 correction/rerun workflow or email result notification. Cycle lifecycle and audit behavior are specified in ADR 0003.

## 9. Deployment and operations

The proposed runtime consists of a static frontend deployment, an HTTPS-accessible API service, and a private PostgreSQL service. The frontend calls the API through a same-origin route or an explicitly configured trusted origin; cookie and CORS settings must match that deployment topology.

Production readiness includes:

- Environment-specific configuration and managed secrets.
- Automated build and deployment checks, plus controlled database migrations.
- Database backups with a tested restore procedure and agreed recovery objectives.
- Health checks, structured logs, error monitoring, and alerts for API/database availability and failed raffle execution.
- Least-privilege database credentials and restricted network access to PostgreSQL.
- Operational runbooks for failed deployments, migrations, session/security incidents, and raffle recovery.

Hosting provider, regions, availability targets, recovery time and recovery point objectives, and data retention requirements remain to be selected based on project constraints.

## 10. Verification strategy

- **Frontend tests:** use Vitest and Testing Library for components, hooks, route behavior, and user-visible loading/error/success states. Current tests mock API functions directly; the browser MSW worker is for development only.
- **API unit and contract tests:** cover express-zod-api/Zod 4 validation, Problem Details normalization, generated OpenAPI consistency, Better Auth integration and middleware ordering, authorization, account deletion, cycle transitions, and raffle policy.
- **Database integration tests:** verify constraints, migrations, transaction rollback, uniqueness, and concurrent raffle protection against PostgreSQL.
- **End-to-end tests:** exercise open signup without email verification, password reset, resident account deletion with history retention, enrollment, history and assignment views, cycle start/close/reopen, and administrator raffle execution.
- **Security checks:** verify unauthenticated access, role boundaries, resident ownership boundaries, password handling, session behavior, and input abuse controls.
- **Acceptance scenarios:** demonstrate no duplicate registration per cycle, no duplicate spot or user assignment per cycle, exclusion of reserved/maintenance spots, rejection of late cycle starts, automatic close/expiry, allowed early reopen only before deadline, a `409` Problem Details response for empty-run attempts, unchanged history after account deletion, stored-result behavior for retries/concurrent requests, and safe oversubscription.

Test fixtures and policies must distinguish established requirements from decisions still awaiting approval. Frontend mock tests alone cannot demonstrate database integrity or production security.

## 11. Risks and mitigations

| Risk | Architectural response |
|---|---|
| Frontend and API contract drift | Generate OpenAPI from express-zod-api/Zod 4 endpoint definitions, exercise the contract in integration tests, and keep browser-development MSW handlers aligned with production behavior. |
| Account deletion damages raffle history | Retain the user ID as a non-login tombstone and remove only credentials and personal details. |
| Concurrent or repeated raffle execution | Lock the cycle row and use assignment uniqueness constraints inside one transaction; return the stored result for a retry or concurrent request against a completed cycle. |
| Authorization gaps expose resident data | Centralize server-side access checks and test each role and ownership boundary. |
| Data loss or migration failure | Use versioned migrations, backups, restore drills, and controlled deployment procedures. |
| Current frontend behavior implies insecure identity inputs | Derive caller identity from the server session and treat client-supplied identifiers as untrusted. |
| Operational requirements remain undefined | Set availability and recovery targets, monitoring ownership, and support procedures before production release. |

## 12. Implementation sequence

1. **Initiation and architecture:** confirm workflows and policy decisions; approve the API contract, domain model, security model, deployment topology, and acceptance criteria.
2. **Backend foundation:** establish Express 5, express-zod-api/Zod 4, Better Auth, Drizzle schema and migrations, `/api/v1` conventions, role enforcement, and Problem Details normalization. Verify Better Auth middleware ordering and error normalization.
3. **Core parking and raffle capabilities:** implement preloaded inventory, automatic cycle provisioning, audited cycle actions, registration, manual raffle execution, account deletion tombstones, assignment history, and transactional integrity.
4. **Frontend integration:** replace mock-backed production calls with the real API while retaining MSW for browser development; current tests continue to mock API functions directly. Add consistent user-facing error and loading feedback.
5. **System validation and production readiness:** run database integration, end-to-end, and security checks; provision hosting, observability, backups, restore procedures, and operational runbooks.

## 13. Assumptions and decisions to confirm

This draft assumes one community, single-role resident or administrator accounts, quarterly cycles, React, Express 5/Node.js/TypeScript, express-zod-api/Zod 4, Better Auth, Drizzle, PostgreSQL, server-enforced authorization, and MSW for browser-side frontend development. Current frontend tests mock API functions directly. V1 has open resident signup without mandatory email verification, no resident approval roster, manual raffle execution, and non-login tombstones for self-deleted residents. Remaining decisions are tracked in [Open Questions](open-questions.md); proposed out-of-scope features are tracked in [the roadmap](future-enhancements.md).
