# @brickset-api/client

## 0.1.0

### Minor Changes

- 5ddce00: Add a typed `requestBatch` helper to run multiple Brickset requests with controlled concurrency.

  Includes:

  - tuple-aware result typing per request
  - configurable `{ concurrency }`
  - reuse of existing middleware, caching, and error handling via the regular request pipeline
  - README batch usage example

## 0.0.2

### Patch Changes

- Introduce a high-level Brickset API client with safe defaults, middleware support, caching primitives, and typed convenience methods for common endpoints.
