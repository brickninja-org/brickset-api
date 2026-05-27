# @brickset-api/client

High-level TypeScript-first client for the Brickset API.

Built on:
- `@brickset-api/types` for strict response/option typing
- `@brickset-api/fetch` for low-level request execution

## Features

- Typed endpoint methods (`login`, `getSets`, `getThemes`, `getSubthemes`, `getYears`, `getCollection`, `getAdditionalImages`, `getInstructions`, `getInstructionsBySetNumber`, `getReviews`, `getKeyUsageStats`, `getUserNotes`, `getUserFlagLabels`, `setUserFlagLabels`, `getUserMinifigNotes`, `getMinifigCollection`, `setMinifigCollection`, `setCollection`)
- Safe defaults for caching
- Middleware pipeline
- Error sanitization to avoid leaking request secrets

## Install

```bash
pnpm add @brickset-api/client @brickset-api/types @brickset-api/fetch
```

## Quickstart

```ts
import { BricksetApiClient } from '@brickset-api/client';

const client = new BricksetApiClient({
  auth: {
    apiKey: process.env.BRICKSET_API_KEY!,
    userHash: process.env.BRICKSET_USER_HASH,
  },
});

const themes = await client.getThemes();
const sets = await client.getSets({ theme: 'Technic', pageSize: 50 });
const images = await client.getAdditionalImages(10276);
const instructions = await client.getInstructions(10276);
const reviews = await client.getReviews(10276);
const usage = await client.getKeyUsageStats();
const minifigs = await client.getMinifigCollection({ owned: 1 });
```

## Security defaults

- Sensitive values are redacted when generating cache keys (`apiKey`, `userHash`, `username`, `password`)
- Mutating/auth endpoints are not cached by default
- Errors are sanitized by default (`sanitizeErrors: true`)

## Extensibility

Use custom middleware/caching:

```ts
const client = new BricksetApiClient({
  auth: { apiKey: '...' },
  middlewares: [async (request, next) => {
    const started = Date.now();
    const result = await next(request);
    console.log(request.endpoint, Date.now() - started);
    return result;
  }],
});
```

Rate limiting helper:

```ts
import { BricksetApiClient, createRateLimitMiddleware } from '@brickset-api/client';

const client = new BricksetApiClient({
  auth: { apiKey: '...' },
  middlewares: [createRateLimitMiddleware(250)],
});
```
