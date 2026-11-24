# Developer Onboarding

This guide takes a new developer from a fresh checkout to a running frontend and backend. Read the root [README](../README.md) for the project overview and [system architecture](system-architecture.md) for design context.

## Prerequisites

- Node.js 22 or newer and npm
- Docker Compose, for the local PostgreSQL service
- Git

The backend package declares Node.js 22 or newer. Install dependencies separately in `frontend/` and `backend/`; there is no root npm workspace.

## Configure and start the backend

From the repository root, open a terminal and run:

```sh
cd backend
npm ci
cp .env.example .env
```

Edit `backend/.env` and replace `BETTER_AUTH_SECRET` with a unique random value of at least 32 characters. Keep `.env` local and do not commit it. The example file configures the local API on port `4000`, PostgreSQL at `localhost:5432`, and the frontend origin at `http://localhost:5173`.

Start the database and API:

```sh
docker compose up -d postgres
npm run db:migrate
npm run dev
```

The Docker Compose service uses development-only local credentials and persists data in a named volume. Do not reuse those credentials outside local development.

Verify the backend at:

- Health: `http://localhost:4000/api/v1/health`
- Generated API document: `http://localhost:4000/api/v1/openapi.json`

The health endpoint reports API and database readiness in its response body.

## Configure and start the frontend

In a second terminal from the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The frontend uses MSW handlers and seeded mock data for simulated workflows. The backend currently provides its foundation, including health, OpenAPI, authentication integration, and the initial schema; resident, registration, cycle, and raffle endpoints are not yet implemented there.

## Common setup issues

- **Port already in use:** stop the process using port `5432`, `4000`, or `5173`, then retry. The backend's configured port can be changed with `PORT`; the local database port is configured in `backend/compose.yaml`.
- **Database connection or migration fails:** confirm Docker Compose reports PostgreSQL as running and that `DATABASE_URL` in `backend/.env` matches the local Compose service. Run migrations from `backend/`.
- **Backend exits during startup:** confirm `BETTER_AUTH_SECRET` is present and at least 32 characters, and that the remaining values in `.env` are valid URLs where required.
- **Frontend behavior does not reflect backend data:** this is expected while the relevant frontend flows use MSW. A running backend does not replace those mocks automatically.
- **Dependencies do not match the lockfile:** use `npm ci` in each package directory rather than installing from the repository root.

For backend-specific environment details and migration instructions, see [Backend README](../backend/README.md). For unresolved system questions, see [Open Questions](open-questions.md).
