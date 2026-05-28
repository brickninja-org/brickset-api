# @brickset-api/client

## 0.1.2

### Patch Changes

- 79c647b: Add high-level client wrappers for Brickset auth validation:

  - `checkKey()`
  - `checkUserHash()`

  Also updates the client README to document these methods.

## 0.1.1

### Patch Changes

- 8adc9e7: Align Brickset API parameter modeling and client-side validation:

  - Fix `getSets` options typing so `query` matches docs as a string search term.
  - Add stricter `setUserFlagLabels` typing helper in types.
  - Add runtime validation guards in client for documented limits (pagination, quantity ranges, rating, flag-label length).

- Updated dependencies [8adc9e7]
  - @brickset-api/types@0.0.19
  - @brickset-api/fetch@0.0.20

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
