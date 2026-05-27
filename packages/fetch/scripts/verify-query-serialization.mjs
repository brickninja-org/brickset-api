const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const calls = [];
globalThis.fetch = async (request) => {
  const req = request instanceof Request ? request : new Request(request);
  calls.push(new URL(req.url));

  return new Response(
    JSON.stringify({ status: 'success', matches: 0, sets: [] }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
};

const { fetchBricksetApi } = await import('../dist/index.js');

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

assert(calls.length === 2, 'Expected 2 fetch calls');

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
