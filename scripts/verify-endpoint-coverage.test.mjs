import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyCoverage } from './verify-endpoint-coverage.mjs';

const endpointsSource = `
export type KnownAuthenticatedEndpoint =
  | '/api/v3.asmx/checkUserHash'
  | '/api/v3.asmx/getCollection';

export type KnownUnauthorizedEndpoint =
  | '/api/v3.asmx/checkKey'
  | '/api/v3.asmx/login';
`;

test('verifyCoverage passes when coverage matches endpoint unions', () => {
  const coverageSource = `
| Endpoint | types | fetch | client |
| --- | --- | --- | --- |
| \`/api/v3.asmx/checkKey\` | yes | yes | yes |
| \`/api/v3.asmx/checkUserHash\` | yes | yes | yes |
| \`/api/v3.asmx/getCollection\` | yes | yes | yes |
| \`/api/v3.asmx/login\` | yes | yes | yes |
`;
  const result = verifyCoverage(endpointsSource, coverageSource);
  assert.equal(result.ok, true);
});

test('verifyCoverage fails on missing, unknown, duplicate, and malformed rows', () => {
  const coverageSource = `
| Endpoint | types | fetch | client |
| --- | --- | --- | --- |
| \`/api/v3.asmx/checkKey\` | yes | yes | yes |
| \`/api/v3.asmx/checkKey\` | yes | yes | yes |
| \`/api/v3.asmx/notReal\` | yes | yes | yes |
| \`/api/v3.asmx/login\` | maybe | yes | yes |
`;
  const result = verifyCoverage(endpointsSource, coverageSource);
  assert.equal(result.ok, false);
  assert.deepEqual(result.missingInCoverage, ['/api/v3.asmx/checkUserHash', '/api/v3.asmx/getCollection', '/api/v3.asmx/login']);
  assert.deepEqual(result.unknownInCoverage, ['/api/v3.asmx/notReal']);
  assert.deepEqual(result.duplicateCoverageEntries, ['/api/v3.asmx/checkKey']);
  assert.equal(result.malformedCoverageRows.length, 1);
});
