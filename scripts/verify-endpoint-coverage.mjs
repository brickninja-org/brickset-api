import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const ENDPOINTS_FILE = resolve(ROOT, 'packages/types/endpoints.ts');
const COVERAGE_FILE = resolve(ROOT, 'docs/endpoint-coverage.md');

const endpointsSource = readFileSync(ENDPOINTS_FILE, 'utf8');
const coverageSource = readFileSync(COVERAGE_FILE, 'utf8');

const knownFromTypes = extractKnownEndpoints(endpointsSource);
const endpointsFromCoverage = extractCoverageEndpoints(coverageSource);

const missingInCoverage = diff(knownFromTypes, endpointsFromCoverage);
const unknownInCoverage = diff(endpointsFromCoverage, knownFromTypes);
const duplicateCoverageEntries = findDuplicates(endpointsFromCoverage);

if (missingInCoverage.length > 0 || unknownInCoverage.length > 0 || duplicateCoverageEntries.length > 0) {
  console.error('Endpoint coverage verification failed.');
  if (missingInCoverage.length > 0) {
    console.error('\nMissing in docs/endpoint-coverage.md:');
    for (const endpoint of missingInCoverage) console.error(`- ${endpoint}`);
  }
  if (unknownInCoverage.length > 0) {
    console.error('\nUnknown endpoints in docs/endpoint-coverage.md:');
    for (const endpoint of unknownInCoverage) console.error(`- ${endpoint}`);
  }
  if (duplicateCoverageEntries.length > 0) {
    console.error('\nDuplicate endpoints in docs/endpoint-coverage.md:');
    for (const endpoint of duplicateCoverageEntries) console.error(`- ${endpoint}`);
  }
  process.exit(1);
}

console.log(`Endpoint coverage verified (${knownFromTypes.length} endpoints).`);

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
  const startToken = `export type ${typeName} =`;
  const startIndex = source.indexOf(startToken);
  if (startIndex === -1) return '';

  const afterStart = source.slice(startIndex + startToken.length);
  const semicolonIndex = afterStart.indexOf(';');
  if (semicolonIndex === -1) return '';
  return afterStart.slice(0, semicolonIndex);
}

function extractCoverageEndpoints(source) {
  const rows = source.split('\n').filter((line) => line.startsWith('| `/api/v3.asmx/'));
  const endpoints = rows.map((row) => {
    const cells = row.split('|').map((cell) => cell.trim());
    return cells[1]?.slice(1, -1);
  }).filter(Boolean);

  return uniqueSorted(endpoints);
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
