# Deployment Guide

This guide records the release and operational practices that can be described before a hosting target has been selected. Hosting provider, topology, database operator, and production procedures remain open decisions; this document does not prescribe a provider.

## Release flow

- Develop and integrate changes in `develop`.
- Validate the frontend and backend packages with their applicable tests, lint, type checks, and builds. Review database migration SQL when present.
- After the weekly release is ready and approved, merge `develop` into `main` as the production release.
- For a production hotfix, branch from `main`, release the fix through the hotfix process, and merge it back into both `main` and `develop`.

The repository does not currently define a CI/CD provider or an automated deployment command. Deployment automation and release ownership must be selected as part of the hosting decision.

## Production configuration

The backend requires `DATABASE_URL` and `BETTER_AUTH_SECRET`; configure `BETTER_AUTH_URL` to the public backend origin and `FRONTEND_ORIGIN` to the deployed browser origin. `NODE_ENV` and `PORT` also configure runtime behavior. Provide secrets through the selected hosting platform's secret mechanism, not committed files, images, or logs. Production must not use the development credentials in `backend/compose.yaml` or `backend/.env.example`.

The deployed frontend must be served from an origin accepted by the API's credentialed CORS and authentication configuration. Cookie, CSRF, session-expiry, and origin details depend on the selected topology and are unresolved; see [Open Questions](open-questions.md).

## Database migration and release sequence

1. Build and review the release, including any generated Drizzle migration SQL.
2. Confirm a recoverable database backup exists according to the operational policy selected for production.
3. Apply committed migrations with the backend's `npm run db:migrate` using the release's configured `DATABASE_URL`.
4. Deploy the compatible backend and frontend artifacts.
5. Check `GET /api/v1/health` and review application and database health signals.

The API and frontend builds use `npm run build` from their respective package directories. Database migration rollback and application rollback procedures must be defined with the chosen hosting and database platform; avoid assuming that reversing a schema migration is safe.

## Health, backups, and operations

The backend health endpoint reports API and database readiness. Configure monitoring, alert thresholds, log handling, backup cadence, restore testing, incident response, and operational ownership before production launch. The project has not yet selected availability goals, recovery time and recovery point objectives, retention periods, monitoring services, or support owners.

## Decisions still required

See [Open Questions](open-questions.md) for the current decision list, including hosting provider and region, database operations, email delivery, security settings, backup and recovery targets, and monitoring and support ownership. Update this guide when those decisions are approved.
