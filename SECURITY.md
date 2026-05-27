# Security Hardening Checklist

This repository publishes:
- `@brickset-api/types`
- `@brickset-api/fetch`
- `@brickset-api/client`

Use this checklist to keep the repo and release flow safe.

## 1) Protect `main`

GitHub: `Settings -> Branches -> Branch protection rules -> main`

- Require a pull request before merging.
- Require approvals: at least `1`.
- Dismiss stale approvals when new commits are pushed.
- Require status checks to pass before merging:
  - `Build / Node 22`
  - `Build / Node 24`
  - `Success`
- Require conversation resolution before merging.
- Restrict who can push to matching branches.
- Do not allow force pushes.
- Do not allow deletions.

## 2) Lock down GitHub Actions permissions

GitHub: `Settings -> Actions -> General`

- Actions permissions: allow only verified actions and your allowed list.
- Workflow permissions: `Read repository contents` by default.
- Enable: `Allow GitHub Actions to create and approve pull requests` only if needed for Changesets release PRs.

In workflows:
- Keep least-privilege `permissions:` per job.
- Only publish job should have `id-token: write`.
- Avoid long-lived registry tokens when OIDC is available.

## 3) Enforce npm Trusted Publishing

npm package settings (for all 3 packages):

- Trusted Publisher connected to:
  - Owner: `brickninja-org`
  - Repo: `brickset-api`
  - Workflow file: `ci.yml`
- Authentication requirement:
  - Prefer: `Require two-factor authentication and disallow tokens`.

Repository hygiene:
- Remove legacy npm auth tokens from GitHub secrets.
- Rotate any previously used npm tokens.

## 4) Enable GitHub security features

GitHub: `Security` / `Settings -> Code security and analysis`

- Dependabot alerts: ON
- Dependabot security updates: ON
- Secret scanning: ON
- Push protection for secrets: ON
- Code scanning (CodeQL default setup): ON

## 5) Keep dependencies and workflows updated

- Keep Renovate/Dependabot PRs enabled.
- Prioritize security updates first.
- For workflow changes, require reviewer approval before merge.

## 6) Secret handling standards

- Never log:
  - `apiKey`
  - `userHash`
  - `username`
  - `password`
- Keep `sanitizeErrors` enabled by default in `@brickset-api/client`.
- Rotate credentials regularly and after incidents.

## 7) Incident response (quick flow)

1. Identify impacted package/version and attack surface.
2. Revoke/rotate leaked credentials immediately.
3. Ship patch release from `main` with changeset.
4. Verify CI and npm publish.
5. Document impact and remediation in release notes/changelog.
