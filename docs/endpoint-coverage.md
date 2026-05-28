# Brickset API Endpoint Coverage

This matrix tracks coverage for Brickset API v3 endpoints across:

- `@brickset-api/types` (endpoint options and response typing)
- `@brickset-api/fetch` (typed transport and query serialization)
- `@brickset-api/client` (high-level method wrapper)

Legend:

- `yes`: implemented and available
- `partial`: available, but with limited higher-level convenience

| Endpoint | types | fetch | client |
| --- | --- | --- | --- |
| `/api/v3.asmx/login` | yes | yes | yes |
| `/api/v3.asmx/checkKey` | yes | yes | yes |
| `/api/v3.asmx/checkUserHash` | yes | yes | yes |
| `/api/v3.asmx/getKeyUsageStats` | yes | yes | yes |
| `/api/v3.asmx/getSets` | yes | yes | yes |
| `/api/v3.asmx/getAdditionalImages` | yes | yes | yes |
| `/api/v3.asmx/getInstructions` | yes | yes | yes |
| `/api/v3.asmx/getInstructions2` | yes | yes | yes |
| `/api/v3.asmx/getReviews` | yes | yes | yes |
| `/api/v3.asmx/getThemes` | yes | yes | yes |
| `/api/v3.asmx/getSubthemes` | yes | yes | yes |
| `/api/v3.asmx/getYears` | yes | yes | yes |
| `/api/v3.asmx/getCollection` | yes | yes | yes |
| `/api/v3.asmx/setCollection` | yes | yes | yes |
| `/api/v3.asmx/getUserNotes` | yes | yes | yes |
| `/api/v3.asmx/getUserFlagLabels` | yes | yes | yes |
| `/api/v3.asmx/setUserFlagLabels` | yes | yes | yes |
| `/api/v3.asmx/getMinifigCollection` | yes | yes | yes |
| `/api/v3.asmx/setMinifigCollection` | yes | yes | yes |
| `/api/v3.asmx/getUserMinifigNotes` | yes | yes | yes |

## Notes

- `@brickset-api/fetch` intentionally stays low-level and endpoint-generic.
- `@brickset-api/client` adds validation, sane defaults, sanitization, and middleware support.
- Keep this file updated whenever new endpoints or method wrappers are added.

## How To Update

1. Add or modify endpoint types in `packages/types/endpoints.ts`.
2. Update the table in this file to match the endpoint set exactly.
3. Run `pnpm verify:coverage`.
4. Run `pnpm test` before opening a PR.
