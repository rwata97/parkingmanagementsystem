# Community Parking Management System

A web application for managing residential parking allocations through quarterly raffles. Residents can create accounts, register for raffles, and review assignments and history. Administrators can review resident and parking information and manage raffle cycles.

The project uses a React and TypeScript frontend and a Node.js/TypeScript REST API backed by PostgreSQL. The frontend currently uses Mock Service Worker (MSW) and seeded mock data for its workflows. The backend provides the API and database foundation; resident, cycle, and raffle application endpoints are still under development. The backend foundation includes health and OpenAPI endpoints, Better Auth integration, and the initial database migration.

## Getting started

### Prerequisites

- Node.js 22 or newer
- npm
- Docker Compose (for the local PostgreSQL database)

### Start the backend

In a terminal:

```sh
cd backend
npm ci
cp .env.example .env
```

Edit `backend/.env` and replace `BETTER_AUTH_SECRET` with a unique random value of at least 32 characters. Start PostgreSQL, apply the committed migration, and run the API:

```sh
docker compose up -d postgres
npm run db:migrate
npm run dev
```

The local API listens on `http://localhost:4000`. Check `http://localhost:4000/api/v1/health` for API and database readiness, or view the generated API document at `http://localhost:4000/api/v1/openapi.json`.

### Start the frontend

In a second terminal:

```sh
cd frontend
npm ci
npm run dev
```

Open the Vite URL shown in the terminal (by default, `http://localhost:5173`). The frontend's current MSW handlers simulate API behavior; the running backend foundation does not yet provide the resident and raffle endpoints represented by those mocks.

## Common commands

Run commands from the relevant package directory.

### Frontend (`frontend/`)

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm test` | Run Vitest |
| `npm run test:coverage` | Run tests once with coverage |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Type-check the frontend |
| `npm run build` | Type-check and build for production |

### Backend (`backend/`)

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API in watch mode |
| `npm test` | Run backend foundation checks |
| `npm run typecheck` | Type-check the backend |
| `npm run build` | Compile the API to `dist/` |
| `npm start` | Run the compiled API |
| `npm run db:generate` | Generate a Drizzle migration from schema changes |
| `npm run db:migrate` | Apply committed migrations |
| `npm run db:check` | Check migration ordering |

Review generated migration SQL before committing it. Use the shared Drizzle migration workflow for application and authentication tables.

## Repository layout

```text
.
├── backend/       Node.js API, authentication, database schema, and migrations
├── docs/          Project requirements, architecture, decisions, and diagrams
│   ├── adr/       Architecture Decision Records
│   └── diagrams/  System, container, and data-flow diagrams
└── frontend/      React application, UI components, hooks, MSW handlers, and tests
```

The backend follows a Controller → Service → Model structure for application endpoints. The frontend owns the user interface and calls API routes; MSW supplies simulated responses during frontend development and tests.

## Further reading

- [Onboarding guide](docs/onboarding.md)
- [Development workflow](docs/development-workflow.md)
- [Coding standards](docs/coding-standards.md)
- [Contribution guide](docs/contributing.md)
- [Deployment guide](docs/deployment.md)
- [System architecture](docs/system-architecture.md)
- [Project initiation and scope](docs/project-initiation.md)
- [Architecture decisions](docs/adr/)
- [Architecture diagrams](docs/diagrams/)
- [Open questions](docs/open-questions.md)
- [Backend setup and details](backend/README.md)
- [Frontend overview](frontend/README.md)
