# Future Enhancements / Product Roadmap

This document tracks functionality and architectural improvements that are outside the agreed v1 scope. Items are proposals unless explicitly marked otherwise; listing an item does not authorize implementation. V1 requirements are defined in the [Project Initiation Document](project-initiation.md), and unresolved v1 decisions remain in [Open Questions](open-questions.md).

## Proposed future work

| Status | Phase | Enhancement | Problem it would solve | Related decisions |
|---|---|---|---|---|
| Proposed | V2 | Approved-resident verification and an administrator-managed eligible roster | Restrict raffle participation to verified community residents while allowing public account creation. Would add resident verification, approval workflow, and approved-roster data. | [ADR 0002](adr/0002-authentication-and-sessions.md), [ADR 0003](adr/0003-raffle-execution-integrity.md) |
| Proposed | V2 or later | Automatic raffle execution after registration closes | Reduce reliance on an administrator remembering to run each closed cycle. V1 remains an explicit administrator action. | [ADR 0003](adr/0003-raffle-execution-integrity.md) |
| Proposed | V2 | Administrator spot inventory and status controls | Let administrators add/deactivate spots and manage reserved or maintenance status without setup-time data changes. V1 preloads inventory and has no such UI. | [ADR 0003](adr/0003-raffle-execution-integrity.md), [ADR 0001](adr/0001-technology-baseline.md) |
| Proposed | Later phase | Audited raffle correction or rerun workflow | Provide a controlled way to correct an exceptional result while preserving the original outcome and a complete audit trail. V1 results are not corrected or rerun. | [ADR 0003](adr/0003-raffle-execution-integrity.md) |
| Proposed | Later phase | Administrator account management UI | Reduce the need for an operator setup procedure when creating or removing additional administrators. V1 uses controlled setup and has no admin-management screen. | [ADR 0002](adr/0002-authentication-and-sessions.md) |
| Proposed | Later review | Email ownership verification | Reduce accounts created with mistyped or inaccessible email addresses. V1 follows the current mock and does not require verification. | [ADR 0002](adr/0002-authentication-and-sessions.md) |

## Roadmap maintenance

- Add new items when a useful capability or architectural improvement is discovered but is not part of the agreed v1 scope.
- For each item, state its status, target phase when known, the problem it addresses, and related ADRs or architecture decisions.
- Keep proposed and accepted future work distinct. Do not treat roadmap entries as approval to expand v1 or begin implementation.
