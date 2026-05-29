const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const calls = [];
globalThis.fetch = async (request) => {
  const req = request instanceof Request ? request : new Request(request);
  const url = new URL(req.url);
  calls.push(url);

  if (url.pathname.endsWith('/getThemes')) {
    return new Response('not json', { status: 200, headers: { 'content-type': 'text/plain' } });
  }

  return new Response(
    JSON.stringify({ status: 'success', matches: 0, sets: [] }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
};

const { fetchBricksetApi, BricksetApiError } = await import('../dist/index.js');

await fetchBricksetApi('/api/v3.asmx/getSets', {
  apiKey: 'test-key',
  params: { theme: 'Space', pageSize: 100, orderBy: 'PiecesDESC' },
});

await fetchBricksetApi('/api/v3.asmx/setCollection', {
  apiKey: 'test-key',
  userHash: 'user-hash',
  setID: 123,
  params: { own: 1, qtyOwned: 2 },
});

let rejectedNonJson = false;
try {
  await fetchBricksetApi('/api/v3.asmx/getThemes', { apiKey: 'test-key' });
} catch (error) {
  rejectedNonJson =
    error instanceof BricksetApiError &&
    String(error.message).includes('did not respond with a JSON response');
}
assert(rejectedNonJson, 'Expected non-JSON response to throw BricksetApiError');

assert(calls.length === 3, 'Expected 3 fetch calls');

const [getSetsUrl, setCollectionUrl] = calls;
assert(getSetsUrl.pathname === '/api/v3.asmx/getSets', 'getSets path mismatch');
assert(getSetsUrl.searchParams.get('apiKey') === 'test-key', 'getSets apiKey missing');
assert(getSetsUrl.searchParams.get('params')?.includes('"theme":"Space"'), 'getSets params not serialized');
assert(getSetsUrl.searchParams.get('params')?.includes('"orderBy":"PiecesDESC"'), 'getSets orderBy not serialized');

assert(setCollectionUrl.pathname === '/api/v3.asmx/setCollection', 'setCollection path mismatch');
assert(setCollectionUrl.searchParams.get('apiKey') === 'test-key', 'setCollection apiKey missing');
assert(setCollectionUrl.searchParams.get('userHash') === 'user-hash', 'setCollection userHash missing');
assert(setCollectionUrl.searchParams.get('setID') === '123', 'setCollection setID missing');
assert(setCollectionUrl.searchParams.get('params')?.includes('"own":1'), 'setCollection params not serialized');

console.log('query serialization integration check passed');
