# @brickset-api/fetch

Tiny fetch wrapper for Brickset API v3 with strong TypeScript response typing.

Built to be a minimal low-level layer for:

- `@brickset-api/client` (high-level API client)
- advanced users who want direct request control

## Install

```bash
pnpm add @brickset-api/fetch @brickset-api/types
```

## Usage

```ts
import { fetchBricksetApi } from '@brickset-api/fetch';

const response = await fetchBricksetApi('/api/v3.asmx/getThemes', {
  apiKey: process.env.BRICKSET_API_KEY!,
});

if (response.status === 'success') {
  console.log(response.themes);
}
```

## Features

- Endpoint-aware response types via `@brickset-api/types`
- Query serialization for Brickset-compatible URL parameters
- Optional request/response hooks
- Typed error class (`BricksetApiError`) for non-2xx responses
- Coverage matrix: [`docs/endpoint-coverage.md`](../../docs/endpoint-coverage.md)

## Security notes

- Pass API key and user hash from secure config (env/secrets), never hardcode.
- Prefer `@brickset-api/client` when you need sanitization and guardrails by default.
