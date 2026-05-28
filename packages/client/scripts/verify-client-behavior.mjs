const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const calls = [];
const retryCallsByPath = new Map();
globalThis.fetch = async (request) => {
  const req = request instanceof Request ? request : new Request(request);
  const url = new URL(req.url);
  calls.push(url);
  retryCallsByPath.set(url.pathname, (retryCallsByPath.get(url.pathname) ?? 0) + 1);

  if (url.pathname.endsWith('/getThemes')) {
    return new Response(JSON.stringify({ status: 'success', matches: 1, themes: [{ theme: 'Test', setCount: 1, subthemeCount: 0, yearFrom: 2020, yearTo: 2020 }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (url.pathname.endsWith('/getAdditionalImages')) {
    return new Response(JSON.stringify({ status: 'success', matches: 1, additionalImages: [{ thumbnailURL: 'https://example.com/t.jpg', imageURL: 'https://example.com/i.jpg' }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (url.pathname.endsWith('/getUserNotes')) {
    return new Response(JSON.stringify({ status: 'success', matches: 1, userNotes: [{ setID: 10276, notes: 'note' }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (url.pathname.endsWith('/getMinifigCollection')) {
    return new Response(JSON.stringify({ status: 'success', matches: 1, minifigs: [{ minifigNumber: 'fig-1', name: 'Figure', category: 'Test', ownedInSets: 1, ownedLoose: 0, ownedTotal: 1, wanted: false }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (url.pathname.endsWith('/getInstructions')) {
    return new Response(JSON.stringify({ status: 'success', matches: 1, instructions: [{ URL: 'https://example.com', description: 'PDF' }] }), {
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

  if (url.pathname.endsWith('/getYears') && url.searchParams.get('theme') === 'retry') {
    const count = retryCallsByPath.get(url.pathname) ?? 1;
    if (count === 1) {
      return new Response(JSON.stringify({ status: 'error', message: 'temporary failure' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ status: 'success', matches: 1, years: [{ year: 2024, setCount: 1 }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (url.pathname.endsWith('/getSubthemes') && url.searchParams.get('theme') === 'slow') {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 50);
      const onAbort = () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      if (req.signal.aborted) {
        onAbort();
        return;
      }
      req.signal.addEventListener('abort', onAbort, { once: true });
    });
    return new Response(JSON.stringify({ status: 'success', matches: 1, subthemes: [{ subtheme: 'Slow' }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

const {
  BricksetApiClient,
  InMemoryBricksetClientCache,
  BricksetClientError,
  createRetryMiddleware,
  createTimeoutMiddleware,
} = await import('../dist/index.js');

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
await client.checkKey();
await client.checkUserHash();
await client.getAdditionalImages(10276);
await client.getInstructions(10276);
await client.getUserNotes();
await client.getMinifigCollection({ owned: 1 });
assert(calls.filter((c) => c.pathname.endsWith('/getThemes')).length === 1, 'getThemes should be cached by default');
assert(calls.some((c) => c.pathname.endsWith('/getAdditionalImages') && c.searchParams.get('setID') === '10276'), 'getAdditionalImages should serialize setID');
assert(calls.some((c) => c.pathname.endsWith('/getInstructions') && c.searchParams.get('setID') === '10276'), 'getInstructions should serialize setID');
assert(calls.some((c) => c.pathname.endsWith('/getUserNotes') && c.searchParams.get('userHash') === 'h'), 'getUserNotes should include userHash');
assert(calls.some((c) => c.pathname.endsWith('/checkKey')), 'checkKey should call the checkKey endpoint');
assert(calls.some((c) => c.pathname.endsWith('/checkUserHash') && c.searchParams.get('userHash') === 'h'), 'checkUserHash should include userHash');
assert(calls.some((c) => c.pathname.endsWith('/getMinifigCollection') && c.searchParams.get('params')?.includes('\"owned\":1')), 'getMinifigCollection should serialize params JSON');

let sawSanitized = false;
try {
  await client.setCollection(1, { own: 1 });
} catch (error) {
  const serialized = JSON.stringify(error, Object.getOwnPropertyNames(error));
  sawSanitized =
    error instanceof BricksetClientError &&
    !String(error.message).includes('apiKey') &&
    !serialized.includes('apiKey') &&
    !serialized.includes('userHash') &&
    !('causeError' in error);
}
assert(sawSanitized, 'Expected sanitized BricksetClientError for failed setCollection');

assert(middlewareHits >= 2, 'Expected middleware to run for uncached requests');

const retryClient = new BricksetApiClient({
  auth: { apiKey: 'k' },
  middlewares: [createRetryMiddleware({ retries: 1, baseDelayMs: 1 })],
});
const retried = await retryClient.getYears('retry');
assert(retried.status === 'success', 'Retry middleware should recover from transient 5xx errors');

const timeoutClient = new BricksetApiClient({
  auth: { apiKey: 'k' },
  middlewares: [createTimeoutMiddleware(10)],
});
let timeoutSanitized = false;
try {
  await timeoutClient.getSubthemes('slow');
} catch (error) {
  timeoutSanitized = error instanceof BricksetClientError;
}
assert(timeoutSanitized, 'Timeout middleware should trigger a sanitized BricksetClientError');

let rejectedInvalidGetSets = false;
try {
  await client.getSets({ pageSize: 9999 });
} catch (error) {
  rejectedInvalidGetSets = error instanceof Error && error.message.includes('pageSize');
}
assert(rejectedInvalidGetSets, 'Expected getSets to reject invalid pageSize');

let rejectedInvalidFlags = false;
try {
  await client.setUserFlagLabels({ 1: 'this-label-is-definitely-way-too-long' });
} catch (error) {
  rejectedInvalidFlags = error instanceof Error && error.message.includes('20 characters');
}
assert(rejectedInvalidFlags, 'Expected setUserFlagLabels to reject too-long flag labels');

let rejectedInvalidCollectionQty = false;
try {
  await client.setCollection(1, { qtyOwned: 1000 });
} catch (error) {
  rejectedInvalidCollectionQty = error instanceof Error && error.message.includes('qtyOwned');
}
assert(rejectedInvalidCollectionQty, 'Expected setCollection to reject qtyOwned above 999');

let rejectedInvalidMinifigQty = false;
try {
  await client.setMinifigCollection('fig-1', { qtyOwned: -1 });
} catch (error) {
  rejectedInvalidMinifigQty = error instanceof Error && error.message.includes('qtyOwned');
}
assert(rejectedInvalidMinifigQty, 'Expected setMinifigCollection to reject negative qtyOwned');

console.log('client behavior integration check passed');
