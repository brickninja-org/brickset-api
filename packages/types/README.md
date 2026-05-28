# @brickset-api/types

Strong TypeScript types for Brickset API v3 endpoints, options, and response data.

## Install

```bash
pnpm add @brickset-api/types
```

## Usage

```ts
import type { EndpointType, OptionsByEndpoint } from '@brickset-api/types/endpoints';

type GetThemesResponse = EndpointType<'/api/v3.asmx/getThemes'>;
type GetSetsOptions = OptionsByEndpoint<'/api/v3.asmx/getSets?params={"query":"technic"}'>;
```

## What is included

- Endpoint contracts (`KnownEndpoint`, `OptionsByEndpoint`, `EndpointType`)
- Shared API response wrappers (`success` and `error` variants)
- Data models under `@brickset-api/types/data/*`

## Notes

- The package is TypeScript-first and intended for compile-time safety.
- Runtime validation belongs in `@brickset-api/client`.
