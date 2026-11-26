# Project Initiation Document

## 1. Problem/Objective

Provide a web application that helps a residential community manage quarterly parking allocation. Residents can create accounts, register for raffles, and review assignments and raffle history. Administrators can review resident and parking information and run raffles. The application uses a React and TypeScript frontend connected to an Express 5 REST API built with Node.js and TypeScript, backed by PostgreSQL.

## 2. Scope

### In Scope

- Operate a web application for residential parking allocation through quarterly raffles.
- Provide residents with account registration, sign-in, raffle registration, current assignment, and raffle history.
- Provide administrators with resident and parking spot views and the ability to run a raffle.
- Let administrators start a provisioned cycle, close or reopen registration before its deadline, and run the raffle after registration closes.
- Validate raffle participants and assign available spots using server-side raffle processing.
- Allow residents to delete their own accounts; redact account details while preserving raffle history.
- Persist residents, parking spots, raffle cycles, registrations, raffle results, and assignments in PostgreSQL.
- Protect account and administrative operations through authentication and role-based authorization.
- Use Better Auth for production email/password authentication and database-backed server sessions. Anyone may self-register as a resident without administrator approval or mandatory email verification; administrator accounts are provisioned through controlled setup.
- Use the Better Auth user ID as the resident ID for vehicle, registration, assignment, and history relationships. Do not add an approved-resident roster in v1.
- Define API inputs and outputs with Zod 4 schemas using express-zod-api, validate them at runtime, and generate OpenAPI documentation from those schemas.
- Use versioned Drizzle ORM migrations for Better Auth and application tables in one PostgreSQL migration workflow.
- Provide a responsive interface with shared components for navigation, forms, tables, and parking spot display.
- Maintain automated checks for frontend behavior, backend API operations, database interactions, and critical user workflows.

### Out of Scope

- Payment processing, parking fees, fines, or billing.
- Managing physical access to the parking facility, such as gate controls, access cards, or license plate recognition.
- Real-time parking occupancy monitoring or sensor integration.
- Advanced administrative workflows such as editing resident records, manually assigning spots, or managing maintenance schedules.
- Approved-resident verification, administrator-managed resident eligibility, and in-app spot inventory/status management.
- Ongoing operational support and feature development beyond the defined deployment and production-readiness stage.

## 3. Assumptions

- The community provides initial parking spot inventory during setup.
- The system automatically provisions calendar-quarter cycles for the upcoming target quarter. Administrators start cycles; registration closes at the target quarter boundary in `America/Mexico_City` unless closed earlier.
- Residents provide accurate account and vehicle information when registering.
- Each resident may register once per open raffle cycle.
- Only registered residents are included in a raffle.
- A resident can receive at most one parking spot per cycle.
- Only spots marked available are eligible for raffle assignment; reserved or maintenance spots are excluded.
- Administrators are authorized to view resident information, manage cycle registration state, and run raffles.
- The backend applies the agreed allocation rules: prior-cycle non-winners first, random tie-breaking, and no assignment beyond available spots.
- Seeded mock data and MSW support browser-side frontend development; current frontend tests mock API functions directly. PostgreSQL is the application's persistent data store.
- Users will access the application through a modern web browser with an internet connection.

## 4. Constraints

- The frontend, Node.js/TypeScript REST API, and PostgreSQL database must be available and correctly configured for end-to-end use.
- API schemas and generated OpenAPI documentation must remain aligned with frontend integrations and development MSW scenarios; route-specific schemas remain contract work.
- Better Auth's schema must support the app-managed single role and the existing user-to-registration relationship. Account deletion must preserve a non-login user tombstone for historical references.
- Database schema changes must preserve resident, raffle, registration, and assignment integrity.
- Raffle processing must maintain assignment consistency when requests overlap or fail.
- The application is built for modern web browsers and does not include a native mobile application.
- Cycle start timing is administrator-controlled within the fixed calendar window; the close deadline and allocation behavior are fixed by the accepted policy.
- Deployment depends on suitable hosting, secure configuration of secrets, database provisioning, and operational procedures.
- Project time, staffing, and budget may limit delivery scope and ongoing operations.

## 5. Risks

- Mismatches between frontend and backend API contracts may disrupt user workflows.
- Incorrect authorization checks could expose resident information or allow unauthorized administrative actions.
- Raffle rule ambiguities could lead to disputed outcomes, especially around repeat winners or more registrants than available spots.
- Concurrent raffle requests or partial failures could create inconsistent assignments without a cycle-row lock, database uniqueness constraints, and a transaction covering the complete run.
- Database outages, failed migrations, or inadequate backups could affect availability or data recovery.
- Incomplete integration and end-to-end testing could allow defects across the frontend, API, and database boundaries to reach users.
- Deployment configuration or exposed secrets could create availability or security problems.
- The current admin raffle action uses a hard-coded cycle and must be replaced by the provisioned cycle returned by the API.
- Account deletion preserves history through a tombstone. This behavior and its retention period need to remain clearly separated from hard deletion.
- Limited error and loading feedback may make failures difficult for residents or administrators to understand.

## 6. Success Metrics

- Residents can register, sign in, register for a raffle, view their current assignment, and review raffle history.
- Administrators can view resident and parking spot information and run a raffle for the intended cycle.
- The backend enforces role permissions and raffle eligibility.
- No resident receives more than one assignment per cycle, and no parking spot is assigned to multiple residents in a cycle.
- Raffle results and assignments persist in PostgreSQL and remain available in relevant history views.
- Critical frontend, API, and database workflows pass agreed acceptance checks before production release.
- The deployed application meets agreed availability, security, backup, and recovery requirements.

## 7. Technical Direction

- **Frontend:** Use the React and TypeScript single-page application built with Vite. React Router provides navigation and client-side role-aware route handling; TanStack React Query manages API state; reusable components and custom hooks organize interface elements and client workflows.
- **Backend:** Use Express 5 on Node.js and TypeScript for the REST API.
- **Backend organization:** Use MVC with the React frontend as the View, express-zod-api endpoints as thin Controllers, service functions for use cases and authorization, and Drizzle-backed Models for persistence. The backend returns JSON and does not render templates. See [ADR 0005](adr/0005-backend-mvc-organization.md).
- **API contract:** Use express-zod-api with Zod 4 schemas to validate inputs and outputs and generate OpenAPI. Version routes under `/api/v1`, including Better Auth under `/api/v1/auth`; use RFC 9457 Problem Details and the agreed pagination envelope. Endpoint-specific schemas remain contract work.
- **Data storage:** Use PostgreSQL with Drizzle ORM. Keep Better Auth and application schema in one reviewed, versioned migration workflow. Use Better Auth user IDs as resident IDs; store the optional single vehicle in a one-to-one table and preserve registration/assignment history.
- **Authentication and authorization:** Use Better Auth for email/password authentication and database-backed sessions. Open signup creates a resident account without mandatory email verification. Server-side authorization controls roles and operations. Resident account deletion removes credentials and personal details while retaining a non-login user tombstone.
- **Raffle processing:** Automatically provision quarterly cycles; an administrator starts, may close/reopen before the deadline, and manually runs each cycle after registration closes. Use one PostgreSQL transaction, a cycle row lock, unique assignment constraints, stored spot status, and stored-result retry behavior. Empty runs return `409 Conflict`; v1 does not support result correction or reruns.
- **Development and testing:** Use MSW and seeded data to simulate API behavior during frontend development. Current frontend tests use Vitest and Testing Library with direct API-function mocks; backend tests use Node's built-in test runner. Add PostgreSQL integration and end-to-end checks for critical workflows as backend capabilities mature.
- **Deployment and operations:** Deploy the frontend and API with secure configuration and a provisioned PostgreSQL database. Define CI/CD, database migration, monitoring, backup, and recovery procedures as part of production readiness.

These technology and integrity choices are recorded in [ADRs 0001–0005](adr/0001-technology-baseline.md). Proposed work outside v1 is tracked in the [Future Enhancements / Product Roadmap](future-enhancements.md); unresolved v1 decisions remain in [Open Questions](open-questions.md).

## 8. High-Level RoadMap

- **Phase 1 — Requirements and architecture:** finish endpoint-specific schemas, retention requirements, email delivery selection, deployment topology, and security requirements; verify Better Auth schema and Express middleware compatibility.
- **Phase 2 — Backend and database:** implement Express 5 with express-zod-api/Zod 4, Better Auth, Drizzle migrations, role enforcement, account deletion tombstones, automated cycle provisioning, audited cycle actions, and transactional raffle processing.
- **Phase 3 — Frontend integration and validation:** connect the React application to `/api/v1`; implement account lifecycle and administrator cycle actions; test error handling and allocation edge cases across the system.
- **Phase 4 — Deployment and production readiness:** provision hosting and PostgreSQL, configure secrets and environments, establish CI/CD and migration procedures, verify monitoring, backups, security, and recovery, and complete production acceptance checks.
