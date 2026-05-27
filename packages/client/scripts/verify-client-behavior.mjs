const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const calls = [];
globalThis.fetch = async (request) => {
  const req = request instanceof Request ? request : new Request(request);
  const url = new URL(req.url);
  calls.push(url);

  if (url.pathname.endsWith('/getThemes')) {
    return new Response(JSON.stringify({ status: 'success', matches: 1, themes: [{ theme: 'Test', setCount: 1, subthemeCount: 0, yearFrom: 2020, yearTo: 2020 }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (url.pathname.endsWith('/setCollection')) {
    return new Response(JSON.stringify({ status: 'error', message: 'forced error' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

const { BricksetApiClient, InMemoryBricksetClientCache, BricksetClientError } = await import('../dist/index.js');

let middlewareHits = 0;
const client = new BricksetApiClient({
  auth: { apiKey: 'k', userHash: 'h' },
  cache: new InMemoryBricksetClientCache(),
  middlewares: [async (request, next) => {
    middlewareHits += 1;
    return next(request);
  }],
});

await client.getThemes();
await client.getThemes();
assert(calls.filter((c) => c.pathname.endsWith('/getThemes')).length === 1, 'getThemes should be cached by default');

let sawSanitized = false;
try {
  await client.setCollection(1, { own: 1 });
} catch (error) {
  sawSanitized = error instanceof BricksetClientError && !String(error.message).includes('apiKey');
}
assert(sawSanitized, 'Expected sanitized BricksetClientError for failed setCollection');

assert(middlewareHits >= 2, 'Expected middleware to run for uncached requests');
console.log('client behavior integration check passed');
