# Contributing

## Release Checklist

Use this checklist for all packages:
- `@brickset-api/types`
- `@brickset-api/fetch`
- `@brickset-api/client`

1. Pull latest `main`.
2. Run validation locally:
   - `pnpm install --frozen-lockfile`
   - `pnpm test`
   - optional deeper check: `pnpm --filter @brickset-api/client test:integration`
3. Add a changeset for user-facing changes:
   - `pnpm changeset`
4. Commit and push.
5. Verify GitHub Actions `CI` is green on `main`:
   - `Build / Node 22`
   - `Build / Node 24`
   - `Publish / npm`
6. Verify npm publish result:
   - `pnpm view @brickset-api/types version dist-tags --json`
   - `pnpm view @brickset-api/fetch version dist-tags --json`
   - `pnpm view @brickset-api/client version dist-tags --json`

## Incident And Rollback

If a release is wrong, do not unpublish stable versions. Prefer a fast follow-up patch.

1. Identify impact:
   - package(s), version(s), and broken behavior.
2. Prepare fix on `main`.
3. Add patch changeset:
   - `pnpm changeset`
4. Validate:
   - `pnpm test`
   - `pnpm --filter @brickset-api/client test:integration` (if client/fetch touched)
5. Push and let CI publish the patch automatically.
6. Document in changelog/PR notes what was fixed.

## Security Notes

- Never log `apiKey`, `userHash`, `username`, or `password`.
- Keep `sanitizeErrors` enabled by default in `@brickset-api/client`.
- Keep trusted publishing (GitHub OIDC) enabled for npm.
