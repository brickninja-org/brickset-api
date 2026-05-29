import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const ENDPOINTS_FILE = resolve(ROOT, 'packages/types/endpoints.ts');
const COVERAGE_FILE = resolve(ROOT, 'docs/endpoint-coverage.md');

function main() {
  const endpointsSource = readFileSync(ENDPOINTS_FILE, 'utf8');
  const coverageSource = readFileSync(COVERAGE_FILE, 'utf8');
  const result = verifyCoverage(endpointsSource, coverageSource);

  if (!result.ok) {
    printFailures(result);
    process.exit(1);
  }

  console.log(`Endpoint coverage verified (${result.knownEndpoints.length} endpoints).`);
}

export function verifyCoverage(endpointsSource, coverageSource) {
  const knownEndpoints = extractKnownEndpoints(endpointsSource);
  const coverageRows = extractCoverageRows(coverageSource);
  const coverageEndpoints = coverageRows.map((row) => row.endpoint);

  const missingInCoverage = diff(knownEndpoints, uniqueSorted(coverageEndpoints));
  const unknownInCoverage = diff(uniqueSorted(coverageEndpoints), knownEndpoints);
  const duplicateCoverageEntries = findDuplicates(coverageEndpoints);

  const malformedCoverageRows = coverageSource
    .split('\n')
    .filter((line) => line.startsWith('| `/api/v3.asmx/') && !COVERAGE_ROW_REGEX.test(line));

  const ok =
    missingInCoverage.length === 0 &&
    unknownInCoverage.length === 0 &&
    duplicateCoverageEntries.length === 0 &&
    malformedCoverageRows.length === 0;

  return {
    ok,
    knownEndpoints,
    coverageRows,
    missingInCoverage,
    unknownInCoverage,
    duplicateCoverageEntries,
    malformedCoverageRows,
  };
}

function printFailures(result) {
  console.error('Endpoint coverage verification failed.');
  if (result.missingInCoverage.length > 0) {
    console.error('\nMissing in docs/endpoint-coverage.md:');
    for (const endpoint of result.missingInCoverage) console.error(`- ${endpoint}`);
  }
  if (result.unknownInCoverage.length > 0) {
    console.error('\nUnknown endpoints in docs/endpoint-coverage.md:');
    for (const endpoint of result.unknownInCoverage) console.error(`- ${endpoint}`);
  }
  if (result.duplicateCoverageEntries.length > 0) {
    console.error('\nDuplicate endpoints in docs/endpoint-coverage.md:');
    for (const endpoint of result.duplicateCoverageEntries) console.error(`- ${endpoint}`);
  }
  if (result.malformedCoverageRows.length > 0) {
    console.error('\nMalformed coverage rows (expected: endpoint + yes/partial/no columns):');
    for (const row of result.malformedCoverageRows) console.error(`- ${row}`);
  }
}

const COVERAGE_ROW_REGEX =
  /^\|\s*`(\/api\/v3\.asmx\/[^`]+)`\s*\|\s*(yes|partial|no)\s*\|\s*(yes|partial|no)\s*\|\s*(yes|partial|no)\s*\|$/;

function extractKnownEndpoints(source) {
  const blocks = ['KnownAuthenticatedEndpoint', 'KnownUnauthorizedEndpoint']
    .map((typeName) => extractTypeBlock(source, typeName))
    .filter(Boolean);

  const endpoints = blocks.flatMap((block) => {
    const matches = block.match(/'\/api\/v3\.asmx\/[^']+'/g) ?? [];
    return matches.map((item) => item.slice(1, -1));
  });

  return uniqueSorted(endpoints);
}

function extractTypeBlock(source, typeName) {
  const match = source.match(new RegExp(`export type ${typeName} =([\\s\\S]*?);`));
  return match?.[1] ?? '';
}

function extractCoverageRows(source) {
  const rows = source.split('\n').filter((line) => line.startsWith('| `/api/v3.asmx/'));
  return rows
    .map((row) => {
      const match = row.match(COVERAGE_ROW_REGEX);
      if (!match) return null;
      return {
        endpoint: match[1],
        types: match[2],
        fetch: match[3],
        client: match[4],
      };
    })
    .filter(Boolean);
}

function findDuplicates(values) {
  const seen = new Set();
  const dupes = new Set();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return Array.from(dupes).sort();
}

function diff(a, b) {
  const bSet = new Set(b);
  return a.filter((item) => !bSet.has(item));
}

function uniqueSorted(values) {
  return Array.from(new Set(values)).sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
