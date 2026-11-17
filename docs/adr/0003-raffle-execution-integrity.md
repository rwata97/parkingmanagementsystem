# ADR 0003: Raffle Execution Integrity

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

Running a raffle changes several related records: the durable raffle result, resident-to-spot assignments, and parking spot state. A partial write could leave the system with conflicting assignments or a result that does not match the spot inventory. Concurrent administrator requests or a retry after a lost response could otherwise execute the same cycle more than once.

The production API and database are not implemented yet. The current MSW raffle handler is a development mock and does not provide production transaction or concurrency guarantees. The approved technology baseline uses PostgreSQL.

## Decision

Execute each normal raffle run in one PostgreSQL transaction. Before checking or changing a cycle's execution state, the API must lock that raffle cycle row with a row-level lock. This serializes run requests for the same cycle while allowing unrelated cycles to proceed independently.

Within the transaction, the API must persist the result, assignments, and resulting spot state as one atomic operation. Database constraints must enforce at most one assignment for a resident in a cycle and at most one assignment of a spot in a cycle. A completed normal run is not repeated: a concurrent request or retry for that cycle returns the already persisted result.

V1 does not support intentional reruns or amendments. Any future rerun or amendment capability would require a separate, explicitly authorized workflow and an agreed audit policy.

## Rationale

- The row lock makes the cycle's state check and execution mutually exclusive for competing requests.
- The transaction prevents partial results and spot updates if any write fails.
- Unique constraints protect assignment invariants at the database boundary, including against application defects or overlapping requests.
- Returning the persisted result makes a repeated request safe when the original response was lost, without executing a second allocation.
- PostgreSQL is already the selected persistent database, so this design does not add a locking service or separate concurrency store.

## Alternatives Considered

### Application-level duplicate check only

Checking whether a cycle has run before starting work is insufficient on its own: two requests can both pass the check before either writes a result. The database lock and constraints provide durable safeguards across concurrent API requests.

### Persisted idempotency keys

An idempotency-key record can associate a retried request with its original response, but it adds a key to the API contract and storage model. For this operation, the cycle itself is the stable execution identity, so locking the cycle and returning its persisted result is simpler.

### Serializable transactions

Serializable isolation can detect certain conflicting transactions, but applications must handle serialization failures and retry the full transaction. It does not by itself define the behavior of a repeated request after a cycle has completed. The selected row lock and constraints make that behavior explicit.

## Consequences

- A successful normal run has one persisted result per cycle; subsequent requests return that result.
- Each run holds a lock on its cycle row until its transaction commits or rolls back.
- The API and database schema must implement the cycle lock and assignment uniqueness constraints together; an application-only guard is not sufficient.
- A future rerun policy may require a distinct run history model and a separate authorized operation.
- Raffle eligibility, allocation fairness, tie handling, and communication of unassigned registrants are recorded in the addendum below.

## Decision Addendum — Cycle Lifecycle and Allocation Policy (2026-11-11)

### Cycle schedule and lifecycle

- Automatically provision calendar-quarter cycle records for the upcoming target quarter. The registration period runs during the preceding quarter; its close deadline is the start of the target quarter at `00:00` in `America/Mexico_City`.
- An administrator must explicitly start a provisioned cycle to open registration. Starting after the fixed deadline is rejected; an unstarted cycle expires at the deadline.
- Registration closes automatically at the deadline. An administrator may close registration early and may reopen an early-closed cycle before the deadline. After the deadline, registration cannot reopen.
- Record each start, close, reopen, and raffle-run action with actor, action, timestamp, and an optional reason.
- V1 raffle execution remains a manual administrator action after registration closes, with no additional run deadline. A successful run moves the cycle to completed. A closed cycle with no registrations stays uncompleted; a run request is rejected with `409 Conflict` and creates no result.

The lifecycle states are `scheduled`, `registration_open`, `registration_closed`, `completed`, and `expired`. A retry or concurrent request for a completed cycle returns its stored result.

### Allocation policy

- Any authenticated `RESIDENT` account may register once per open cycle. There is no v1 approved-resident roster or administrator eligibility gate.
- Residents who did not receive an assignment in the immediately previous cycle are selected before previous-cycle recipients. Selection is random within each group, using an unbiased cryptographic shuffle.
- Assign available spots to the prioritized registrants until spots run out. Record remaining registrants as not selected. Reserved and maintenance spots are excluded.
- Show selected/not-selected outcomes and assigned spots in the app; do not add email result notifications in v1.
- V1 does not support raffle corrections or reruns. Account deletion does not change a completed result or active assignment.

### Domain data and integrity

- Registrations and assignments reference the Better Auth user ID, preserving the current mock's relationship. Enforce one registration per user per cycle, one assignment per user per cycle, and one assignment per spot per cycle with database constraints.
- Store spot status as `available`, `assigned`, `reserved`, or `maintenance`, matching the mock. Update spot status and current resident alongside assignment history in the raffle transaction. A later successful cycle run releases prior assigned spots; reserved and maintenance spots remain unavailable.
- Preload spot inventory during setup. V1 has no dashboard controls for adding spots or changing reserved/maintenance status.
- Keep cycle action history, raffle results, assignments, and spot changes consistent in PostgreSQL transactions. Cycle-row locking serializes competing runs for the same cycle.

### Consequences and deferred items

- The system provisions cycles, but an administrator controls when registration opens and can close it early. Raffle execution remains explicit in v1.
- Automatic raffle execution, approved-resident eligibility, and spot inventory controls are proposed future enhancements, not v1 commitments.
- Exact cycle provisioning job mechanics, raffle audit retention, and wider data-retention periods remain implementation or operational work.

## References

- [PostgreSQL explicit locking and row-level locks](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
