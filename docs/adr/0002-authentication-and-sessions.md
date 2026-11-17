# ADR 0002: Authentication and Sessions

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

The Community Parking Management System needs email/password account authentication and persistent browser sessions for resident and administrator workflows. The API must remain the authority for authenticated identity, resident ownership, and administrator permissions.

The frontend currently simulates authentication with MSW and hand-written mock code. The mock generates a Base64 token, returns it in a cookie, and stores mock user data in browser `localStorage`. It is development/test behavior, not production authentication. There is no production API or authentication library in the repository yet.

The project has one developer with TypeScript experience. The planned application database is PostgreSQL. The decision is to use an authentication library for production rather than build the credential and session mechanics directly in application code.

## Decision

Use **Better Auth** for production email/password authentication and server-managed browser sessions. Use the application PostgreSQL database for Better Auth's user, account, verification, and session data; Better Auth stores sessions in its configured database by default unless secondary storage is configured.

The application API remains responsible for parking-system authorization. It must check resident ownership and administrator permissions on protected operations and must not trust client-supplied roles or resident identities.

## Alternatives Considered

### Custom authentication in the application

Writing authentication directly in the API would give the application full control over credential and session behavior. It would also make the project responsible for implementing and maintaining password handling, session issuance and revocation, cookie behavior, recovery flows, and related security protections. The existing mock is not a production implementation to extend.

### Passport.js with session middleware

Passport.js provides authentication middleware and strategies. Its documented session approach requires session middleware such as `express-session`; the application would still need to assemble account registration, password handling, session storage, and recovery behavior. This is more modular, but leaves more authentication plumbing in application code than Better Auth.

## Consequences

- Better Auth will own standard email/password and session mechanics; the application owns the single `ADMIN` or `RESIDENT` role and domain authorization.
- Better Auth's user ID is the resident identity used by registrations and assignments. V1 has no approved-resident roster or administrator approval step.
- Better Auth's Express 5 integration and middleware ordering must be verified during implementation, as recorded in ADR 0004.
- Authentication and session checks depend on PostgreSQL availability. A separate session store is not part of this decision.
- The current MSW mock may continue to support frontend development and tests, but its token and storage behavior must not be treated as the production security design.

## Details Deferred

- Exact cookie attributes and `SameSite` policy for the selected deployment topology.
- The CSRF protection mechanism for state-changing requests.
- Session expiration, refresh, and rotation policies.
- Password-reset email provider and delivery configuration.

## Decision Addendum — V1 Account Lifecycle (2026-11-11)

- Any user may create an account without administrator approval. A successful public signup is assigned the `RESIDENT` role by the server; the client cannot choose or change its role.
- V1 does not require email verification before sign-in or raffle participation. This follows the current mock's self-service registration behavior.
- Bootstrap administrator accounts through a controlled setup process. V1 does not provide an administrator-management UI or allow public signup to select the administrator role.
- Keep password reset by email in scope. The delivery provider is not selected yet, and reset responses must not disclose whether an email address has an account.
- Allow a resident to request account deletion after re-entering their password. Preserve the Better Auth user ID as a non-login tombstone so registrations and assignments remain linked. Remove credential/account records, sessions, and vehicle details; redact the name and replace the required email field with a unique non-deliverable placeholder. Set a `deletedAt` marker and ensure sign-in rejects the profile. Do not use Better Auth's hard-delete operation for this flow.
- If a deleted resident has an active assignment, preserve it through that cycle. Do not rerun or reassign as a side effect of account deletion.

### Rationale and data relationship

The current mock stores a single role on each user, creates resident accounts directly, and references the user's ID from raffle registrations. V1 preserves that relationship rather than introducing a separate roster or resident approval model. The API still derives the resident ID from the authenticated session; it does not trust a resident ID supplied by the browser.

Better Auth documents user deletion as a hard delete. A hard delete would remove or invalidate the user record referenced by historical raffle data. The v1 flow therefore redacts and disables the account while retaining its stable ID. See [Better Auth: User and account management](https://better-auth.com/docs/concepts/users-accounts).

### Details deferred

- Password-reset email provider and delivery configuration.
- Broader retention periods for personal data, raffle history, and backups.
- Exact cookie policy, CSRF protection, session expiry, refresh, and rotation.
- Any future approved-resident roster or verification workflow; this is proposed for a later phase in [the future enhancements roadmap](../future-enhancements.md).

## References

- [Better Auth: Email and password authentication](https://better-auth.com/docs/authentication/email-password)
- [Better Auth: Session management](https://better-auth.com/docs/concepts/session-management)
- [Better Auth: Database support and schema](https://better-auth.com/docs/concepts/database)
- [Better Auth: Express integration](https://better-auth.com/docs/integrations/express)
- [Passport.js: Authentication concepts](https://www.passportjs.org/concepts/authentication/)
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet)
- [OWASP: Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
