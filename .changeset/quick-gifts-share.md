---
"@brickset-api/client": minor
---

Add a typed `requestBatch` helper to run multiple Brickset requests with controlled concurrency.

Includes:
- tuple-aware result typing per request
- configurable `{ concurrency }`
- reuse of existing middleware, caching, and error handling via the regular request pipeline
- README batch usage example
