import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const BASELINE_FILE = resolve(ROOT, 'scripts/api-surface.baseline.json');

const TARGETS = [
  {
    name: '@brickset-api/fetch',
    declarationFile: resolve(ROOT, 'packages/fetch/dist/index.d.ts'),
  },
  {
    name: '@brickset-api/client',
    declarationFile: resolve(ROOT, 'packages/client/dist/index.d.ts'),
  },
];

const shouldUpdate = process.argv.includes('--update');
const current = Object.fromEntries(TARGETS.map((target) => [target.name, collectSymbols(target.declarationFile)]));

if (shouldUpdate) {
  writeFileSync(BASELINE_FILE, `${JSON.stringify(current, null, 2)}\n`, 'utf8');
  console.log(`API surface baseline updated: ${BASELINE_FILE}`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
const errors = [];

for (const target of TARGETS) {
  const name = target.name;
  const currentSymbols = current[name] ?? [];
  const baselineSymbols = baseline[name] ?? [];

  const removed = baselineSymbols.filter((symbol) => !currentSymbols.includes(symbol));
  const added = currentSymbols.filter((symbol) => !baselineSymbols.includes(symbol));

  if (removed.length > 0 || added.length > 0) {
    errors.push(formatDiff(name, removed, added));
  }
}

if (errors.length > 0) {
  console.error('Public API surface verification failed.\n');
  for (const error of errors) {
    console.error(error);
  }
  console.error('\nIf these API changes are intentional, run: pnpm verify:api-surface:update');
  process.exit(1);
}

console.log(`Public API surface verified (${TARGETS.length} packages).`);

function collectSymbols(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const symbols = new Set();

  for (const match of source.matchAll(/^export\s+(?:declare\s+)?(?:class|function|const|type|interface)\s+([A-Za-z0-9_]+)/gm)) {
    symbols.add(match[1]);
  }

  for (const match of source.matchAll(/^export\s*{\s*([^}]+)\s*};?$/gm)) {
    const chunk = match[1];
    for (const piece of chunk.split(',')) {
      const trimmed = piece.trim();
      if (!trimmed) continue;
      const local = trimmed.split(/\s+as\s+/i)[0].trim();
      if (local) symbols.add(local);
    }
  }

  return [...symbols].sort();
}

function formatDiff(pkgName, removed, added) {
  const lines = [`${pkgName}:`];
  if (removed.length > 0) {
    lines.push('  removed symbols:');
    for (const symbol of removed) lines.push(`  - ${symbol}`);
  }
  if (added.length > 0) {
    lines.push('  added symbols:');
    for (const symbol of added) lines.push(`  + ${symbol}`);
  }
  return lines.join('\n');
}
