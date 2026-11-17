# Community Parking Management System — Data Flow Diagrams

These sequence diagrams describe the agreed production data flows. They complement the [system context](system-context.md) and [container](container-diagram.md) diagrams by showing request order, authorization, persistence, and key failure paths.

Mock paths are labeled as such. Production routes are versioned under `/api/v1`, including Better Auth under `/api/v1/auth`, and errors use RFC 9457 Problem Details. Notes below each diagram call out behavior that the MSW mocks do not yet implement.

## 1. Account and session

Anyone may self-register without administrator approval or mandatory email verification. The server assigns the `RESIDENT` role, and the browser keeps a server-managed session cookie and fetches the current user profile.

```mermaid
sequenceDiagram
  actor Resident
  participant Web as Browser app
  participant Auth as Better Auth
  participant DB as PostgreSQL

  opt Register
    Resident->>Web: Submit name, email, password, optional vehicle
    Web->>Auth: Register account
    Auth->>DB: Store auth records and password hash and assign RESIDENT role
    Auth->>DB: Store optional vehicle linked to user ID
    Auth->>DB: Create server-managed session
    DB-->>Auth: Account and session stored
    Auth-->>Web: Set HttpOnly session cookie and return profile
  end

  opt Sign in
    Resident->>Web: Submit email and password
    Web->>Auth: Sign in
    Auth->>DB: Verify password hash
    DB-->>Auth: Authentication result
    Auth->>DB: Create server-managed session
    DB-->>Auth: Session stored
    Auth-->>Web: Set HttpOnly session cookie and return profile
  end

  Web->>Auth: Fetch current user (mock: GET /api/auth/me, cookie included)
  Auth->>DB: Validate session and load profile
  alt Session valid
    DB-->>Auth: User profile
    Auth-->>Web: Current user profile
  else Session missing or invalid
    DB-->>Auth: No valid session
    Auth-->>Web: Unauthorized
  end

  opt Sign out
    Resident->>Web: Sign out
    Web->>Auth: Sign out (mock: POST /api/auth/logout, cookie included)
    Auth->>DB: Revoke session
    DB-->>Auth: Session revoked
    Auth-->>Web: Clear session cookie
    Web->>Auth: Fetch current user again
    Auth-->>Web: Unauthorized and clear authenticated view
  end
```

**Mock difference:** the login mock sets an `auth_token` cookie and returns a token-shaped JSON field. The registration mock returns a token but does not set a cookie. The mocks do not consistently model the agreed production behavior. Production cookies must be `HttpOnly` and `Secure` with an appropriate `SameSite` policy. Production Better Auth routes use `/api/v1/auth`, and role assignment is server-controlled.

## 2. Password reset

The request response does not reveal whether an account exists. Email delivery depends on an email provider that has not yet been selected. Reset completion revokes existing sessions and requires a fresh sign-in.

```mermaid
sequenceDiagram
  actor Resident
  participant Web as Browser app
  participant Auth as Authentication service
  participant DB as PostgreSQL
  participant Mail as Email provider (TBD)

  Resident->>Web: Submit email for password reset
  Web->>Auth: Request reset (mock: POST /api/auth/password/reset/request)
  Auth->>DB: Look up account and prepare reset token if it exists
  opt Account exists
    DB-->>Auth: Account found
    Auth->>DB: Store reset-token verifier
    Auth->>Mail: Send reset link
    Mail-->>Resident: Deliver reset link
  end
  Auth-->>Web: Same generic response in either case
  Web-->>Resident: Show reset-request confirmation

  Resident->>Web: Open link and submit new password
  Web->>Auth: Confirm reset (mock: POST /api/auth/password/reset/confirm)
  Auth->>DB: Validate token, update password hash, and consume token
  Auth->>DB: Revoke all existing sessions
  DB-->>Auth: Password updated and sessions revoked
  Auth-->>Web: Reset succeeded
  Web-->>Resident: Ask resident to sign in again
```

**Mock difference:** the MSW reset handlers always return success. The backing mock does not verify a token, change a password, send email, or revoke sessions. The production delivery provider remains to be selected.

## 3. Resident account deletion

The resident confirms deletion by re-entering their password. The API removes login capability and personal details but keeps the user's ID as a tombstone so historical registrations and assignments remain valid. Any active assignment remains in effect through its cycle.

```mermaid
sequenceDiagram
  actor Resident
  participant Web as Browser app
  participant API as REST API
  participant Auth as Better Auth
  participant DB as PostgreSQL

  Resident->>Web: Request account deletion and re-enter password
  Web->>API: Confirm deletion (session cookie)
  API->>Auth: Verify current user and password
  Auth-->>API: User identity confirmed
  API->>DB: Begin transaction and revoke sessions and remove credential/account records
  API->>DB: Remove vehicle, redact name, and replace required email with non-deliverable placeholder
  API->>DB: Set deletedAt and mark profile non-login and retain user ID tombstone
  Note over DB: Registrations, assignments, and active spot state remain linked
  API->>DB: Commit
  API-->>Web: Deletion complete and clear cookie
  Web-->>Resident: Sign out and clear local user state
```

**Data-model note:** Better Auth's hard-delete operation is not used because historical raffle rows reference the user ID. The tombstone cannot authenticate and contains no personal profile data.

## 4. Resident reads

After session restore, the resident dashboard requests the current raffle, spot inventory, and the signed-in resident's history independently in parallel.

```mermaid
sequenceDiagram
  actor Resident
  participant Web as Browser app
  participant API as REST API
  participant DB as PostgreSQL

  Web->>API: Fetch current user (mock: GET /api/auth/me, cookie included)
  API->>DB: Validate session
  DB-->>API: Resident profile and role
  API-->>Web: Current resident profile
  Note over Web,API: If no valid resident session, route to sign-in and do not load resident views

  par Current raffle
    Web->>API: GET /api/v1/raffles/current (cookie included)
    API->>DB: Check session and read current cycle and registration state
    DB-->>API: Current-cycle data
    API-->>Web: Current raffle data
  and Spot inventory
    Web->>API: GET /api/v1/spots (cookie included)
    API->>DB: Check session and read spots
    DB-->>API: Spot IDs and statuses
    API-->>Web: Spot IDs and statuses only
  and Personal history
    Web->>API: GET /api/v1/resident/raffle-history (cookie included)
    API->>DB: Derive resident from session and read that resident's history
    DB-->>API: Resident's history rows
    API-->>Web: Resident's history only
  end

  Note over API,DB: Every protected read is authorized server-side, and resident spot data omits assigned resident identity
```

**Mock difference:** the history mock derives identity from the cookie, but current-raffle and spot handlers do not enforce a session. The spots mock returns `residentId`, while production resident responses contain only spot IDs and statuses.

## 5. Raffle registration

The API derives the resident from the session and selects the open, upcoming target-quarter cycle. Any `RESIDENT` account may register, with no approved-roster check. Duplicate submissions return the existing successful registration state.

```mermaid
sequenceDiagram
  actor Resident
  participant Web as Browser app
  participant API as REST API
  participant DB as PostgreSQL

  Resident->>Web: Register for the current raffle
  Web->>API: POST /api/v1/raffles/register (session cookie, no residentId)
  API->>DB: Validate session and resident role
  alt No valid resident session
    API-->>Web: Unauthorized or forbidden
  else Resident session valid
    API->>DB: Resolve open cycle and check role and duplicate registration
    alt Cycle closed or user is not a resident
      DB-->>API: Registration not allowed
      API-->>Web: Reject registration
    else Registration allowed
      API->>DB: Check for existing registration in current cycle
      alt Already registered
        DB-->>API: Existing registration
        API-->>Web: Return existing successful state
      else New registration
        API->>DB: Insert registration under cycle/resident uniqueness constraint
        DB-->>API: Registration stored
        API-->>Web: Return successful state
      end
    end
  end

  opt Registration successful
    Web->>API: Refresh GET /api/v1/raffles/current
    API-->>Web: Updated registration count/state
    Web->>API: Refresh GET /api/v1/resident/raffle-history
    API-->>Web: Updated resident history-related state
  end
```

**Mock difference:** the current hook sends `residentId`, and the mock trusts it. Production derives the same user ID from the session instead of trusting the client, while the stored user-to-registration relationship remains unchanged. The mock does not enforce cycle-open status or the database uniqueness constraint.

## 6. Admin dashboard reads

After admin session restore, the dashboard loads its four data sets independently in parallel. Each request is authorized by the API, regardless of the client-side route guard.

```mermaid
sequenceDiagram
  actor Admin as Administrator
  participant Web as Browser app
  participant API as REST API
  participant DB as PostgreSQL

  Web->>API: Fetch current user (mock: GET /api/auth/me, cookie included)
  API->>DB: Validate session and load role
  DB-->>API: Administrator profile
  API-->>Web: Current administrator profile

  par Residents
    Web->>API: GET /api/v1/residents (cookie included)
    API->>DB: Verify admin role and read resident accounts
    DB-->>API: Resident records
    API-->>Web: Resident records
  and Spots
    Web->>API: GET /api/v1/spots (cookie included)
    API->>DB: Verify admin role and read spot inventory and assignment identities
    DB-->>API: Administrative spot data
    API-->>Web: Spot data including assignment identities
  and Current raffle
    Web->>API: GET /api/v1/raffles/current (cookie included)
    API->>DB: Verify admin role and read current cycle and registration count
    DB-->>API: Current-cycle data
    API-->>Web: Current-cycle data
  and Raffle list
    Web->>API: GET /api/v1/admin/raffles (cookie included)
    API->>DB: Verify admin role and read raffle results
    DB-->>API: Raffle history
    API-->>Web: Raffle history
  end

  Note over API,DB: Unauthorized and non-admin requests are rejected server-side
```

**Mock difference:** the current admin route guard checks the role in the browser, but the mock GET handlers do not enforce admin authorization. V1 provides read-only resident and spot views, while roster and spot editing controls are deferred. The dashboard does not currently request raffle-detail retrieval.

## 7. Cycle activation and registration control

The system provisions a scheduled cycle for the upcoming quarter. The administrator starts it to open registration. Registration closes automatically at the fixed target-quarter boundary in `America/Mexico_City`. An administrator may close early or reopen before that deadline. A cycle that was never started expires at the deadline.

```mermaid
sequenceDiagram
  actor Admin as Administrator
  participant Web as Browser app
  participant API as REST API
  participant DB as PostgreSQL
  participant Scheduler as Calendar scheduler

  Scheduler->>DB: Provision upcoming scheduled cycle
  Admin->>Web: Start cycle
  Web->>API: POST /api/v1/admin/cycles/{id}/start (cookie included)
  API->>DB: Verify admin, lock cycle row, and check deadline/state
  alt Start allowed
    API->>DB: Set registration_open and record actor/time
    API-->>Web: Cycle opened
  else Start after deadline or invalid state
    API-->>Web: Problem Details error
  end

  opt Administrator closes registration early
    Admin->>Web: Close registration
    Web->>API: POST /api/v1/admin/cycles/{id}/close (cookie included)
    API->>DB: Set registration_closed and record actor/time/reason
    API-->>Web: Cycle closed
    opt Reopen before fixed deadline
      Admin->>Web: Reopen registration
      Web->>API: POST /api/v1/admin/cycles/{id}/reopen (cookie included)
      API->>DB: Set registration_open and record actor/time/reason
      API-->>Web: Cycle reopened
    end
  end

  Scheduler->>DB: At deadline, close open cycles and expire unstarted cycles
  Note over API,DB: Closed cycles remain eligible for a manual administrator raffle run
```

Every start, close, reopen, and run action records its actor, action, time, and optional reason. V1 does not automatically execute the raffle.

## 8. Admin raffle execution

The dashboard displays a closed cycle. The API rejects an attempt to run an empty cycle with `409 Conflict` and no result. A retry for a cycle that already completed returns its saved result, as specified in [ADR 0003](../adr/0003-raffle-execution-integrity.md).

```mermaid
sequenceDiagram
  actor Admin as Administrator
  participant Web as Browser app
  participant API as REST API
  participant DB as PostgreSQL
  participant Allocator as Allocation policy

  Web->>API: GET /api/v1/raffles/current (cookie included)
  API->>DB: Verify admin role and read closed cycle and registration count
  DB-->>API: Closed cycle and registration count
  API-->>Web: Cycle data

  Admin->>Web: Run raffle for closed cycle
  Web->>API: POST /api/v1/admin/cycles/{id}/run (cookie included)
  API->>DB: Verify admin session and role
  alt Unauthorized or non-admin
    API-->>Web: Reject request
  else Administrator authorized
    API->>DB: Begin transaction and lock submitted cycle row
    DB-->>API: Cycle locked
    API->>DB: Check for an already completed result
    alt Result already exists
      DB-->>API: Saved result
      API->>DB: End read/lock transaction
      API-->>Web: Return saved result without rerunning
    else No completed result
      API->>DB: Verify cycle is closed and not expired
      alt Cycle is not closed
        DB-->>API: Cycle is not executable
        API->>DB: Roll back transaction
        API-->>Web: Problem Details error
      else Cycle is closed
        API->>DB: Check registrations for cycle
        alt Zero registrations
          DB-->>API: No registrations
          API->>DB: Roll back transaction
          API-->>Web: 409 Problem Details, no result is created
        else Registrations exist
          API->>Allocator: Apply approved allocation policy
          Note over API,Allocator: Prior-cycle non-winners first, then cryptographic unbiased shuffle within groups
          Allocator-->>API: Proposed result and assignments
          API->>DB: Persist result, assignments, and updated spot state
          alt Any write fails
            DB-->>API: Persistence error
            API->>DB: Roll back all writes
            API-->>Web: Return failure and show error
          else All writes succeed
            API->>DB: Commit transaction
            DB-->>API: Result, assignments, and spot state committed
            API-->>Web: Return raffle result
            par Refresh raffle list
              Web->>API: GET /api/v1/admin/raffles
              API-->>Web: Updated raffle history
            and Refresh current cycle
              Web->>API: GET /api/v1/raffles/current
              API-->>Web: Updated cycle data
            and Refresh spots
              Web->>API: GET /api/v1/spots
              API-->>Web: Updated spot assignments and statuses
            end
          end
        end
      end
    end
  end
```

**Mock difference:** the current admin page passes a hard-coded cycle, and the mock handler does not enforce admin authorization, cycle lifecycle, empty-registration blocking, or transaction/locking guarantees. Production preserves the mock's previous-cycle non-winner priority but uses a cryptographic unbiased shuffle.
