import { fetchBricksetApi } from '../packages/fetch/dist/index.js';

const apiKey = process.env.BRICKSET_API_KEY;
const userHash = process.env.BRICKSET_USER_HASH;

if (!apiKey) {
  console.error('Missing required BRICKSET_API_KEY.');
  process.exit(1);
}

const checks = [];

checks.push(await runCheck('checkKey', async () => {
  const result = await fetchBricksetApi('/api/v3.asmx/checkKey', { apiKey });
  return result.status === 'success';
}));

checks.push(await runCheck('getThemes', async () => {
  const result = await fetchBricksetApi('/api/v3.asmx/getThemes', { apiKey });
  return result.status === 'success' && Array.isArray(result.themes);
}));

checks.push(await runCheck('getYears(Technic)', async () => {
  const result = await fetchBricksetApi('/api/v3.asmx/getYears', { apiKey, theme: 'Technic' });
  return result.status === 'success' && Array.isArray(result.years);
}));

if (userHash) {
  checks.push(await runCheck('checkUserHash', async () => {
    const result = await fetchBricksetApi('/api/v3.asmx/checkUserHash', { apiKey, userHash });
    return result.status === 'success';
  }));
}

const failed = checks.filter((item) => !item.ok);
if (failed.length > 0) {
  console.error('Live smoke checks failed:');
  for (const item of failed) {
    console.error(`- ${item.name}: ${item.errorMessage}`);
  }
  process.exit(1);
}

console.log(`Live smoke checks passed (${checks.length} checks).`);

async function runCheck(name, fn) {
  try {
    const ok = await fn();
    if (!ok) {
      return { name, ok: false, errorMessage: 'unexpected response shape' };
    }
    return { name, ok: true };
  } catch (error) {
    return { name, ok: false, errorMessage: sanitizeErrorMessage(error) };
  }
}

function sanitizeErrorMessage(error) {
  const raw = error instanceof Error ? error.message : String(error);
  let value = raw;
  if (apiKey) value = value.replaceAll(apiKey, '***');
  if (userHash) value = value.replaceAll(userHash, '***');
  return value;
}
