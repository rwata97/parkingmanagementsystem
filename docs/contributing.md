# Contribution Guide

This guide defines the project's branch, commit, and pull request conventions. Contributions should be focused, reviewable, and validated with the checks applicable to the changed package.

## Branching model

- `main` is the production branch and should contain stable, released code.
- `develop` is the integration branch for ongoing development.
- Create new feature, bug-fix, maintenance, refactor, and test branches from `develop`.
- Target feature and bug-fix pull requests to `develop`, never directly to `main`.
- When the weekly release is ready and approved, merge `develop` into `main`.
- For a production hotfix, branch from `main`. Merge the fix into `main` and back into `develop` to keep both branches synchronized.

## Branch names

Use the appropriate lowercase prefix, followed by a lowercase, hyphen-separated description:

| Prefix | Use |
| --- | --- |
| `feature/` | New functionality |
| `bugfix/` | Bug fixes |
| `hotfix/` | Urgent production fixes |
| `chore/` | Maintenance, configuration, and dependency updates |
| `refactor/` | Restructuring without behavior changes |
| `test/` | Test-related changes |

Examples: `feature/user-authentication`, `bugfix/form-validation`, `chore/update-dependencies`.

## Commits

Use Conventional Commits with a concise, descriptive subject. Common types include `feat`, `fix`, `chore`, `refactor`, and `test`.

```text
feat: add user profile page
fix: resolve login validation issue
chore: update dependencies
refactor: simplify API error handling
test: add unit tests for authentication
```

## Pull requests

- Target `develop`, except production hotfix pull requests, which target `main`.
- Keep each branch and pull request focused on one feature, bug fix, or task.
- Explain what changed, why it changed, and what testing was performed.
- Run applicable tests, linting, type checks, and builds before requesting merge; list the commands and outcomes in the description.
- Obtain appropriate review before merging.
- Include reviewed Drizzle migration SQL with schema changes.

Do not merge ordinary development work directly into `main`. Weekly releases are made from approved changes in `develop`; hotfixes must be carried back to `develop` after reaching `main`.
