import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();

const POLICIES = [
  {
    dir: 'packages/types',
    expectedFiles: ['endpoints.ts', 'data', 'README.md', 'CHANGELOG.md'],
    requiredFields: ['name', 'version', 'license', 'files'],
  },
  {
    dir: 'packages/fetch',
    expectedFiles: ['dist', 'README.md', 'CHANGELOG.md'],
    requiredFields: ['name', 'version', 'license', 'main', 'types', 'files'],
  },
  {
    dir: 'packages/client',
    expectedFiles: ['dist', 'README.md', 'CHANGELOG.md'],
    requiredFields: ['name', 'version', 'license', 'main', 'types', 'files'],
  },
];

const errors = [];

for (const policy of POLICIES) {
  const pkgPath = resolve(ROOT, policy.dir, 'package.json');
  const manifest = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const files = manifest.files;

  for (const field of policy.requiredFields) {
    if (manifest[field] === undefined) {
      errors.push(`${policy.dir}: missing required package.json field "${field}"`);
    }
  }

  if (!Array.isArray(files)) {
    errors.push(`${policy.dir}: "files" must be an array`);
    continue;
  }

  const normalized = [...files].sort();
  const expected = [...policy.expectedFiles].sort();
  if (JSON.stringify(normalized) !== JSON.stringify(expected)) {
    errors.push(
      `${policy.dir}: "files" must exactly equal [${expected.join(', ')}], found [${normalized.join(', ')}]`,
    );
  }

  for (const item of files) {
    const path = resolve(ROOT, policy.dir, item);
    if (!existsSync(path)) {
      errors.push(`${policy.dir}: publish file path does not exist on disk: "${item}"`);
    }
  }

  if (typeof manifest.main === 'string') {
    const mainPath = resolve(ROOT, policy.dir, manifest.main);
    if (!existsSync(mainPath)) {
      errors.push(`${policy.dir}: "main" points to missing file "${manifest.main}"`);
    }
  }

  if (typeof manifest.types === 'string') {
    const typesPath = resolve(ROOT, policy.dir, manifest.types);
    if (!existsSync(typesPath)) {
      errors.push(`${policy.dir}: "types" points to missing file "${manifest.types}"`);
    }
  }
}

if (errors.length > 0) {
  console.error('Publish artifact policy verification failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Publish artifact policy verified (${POLICIES.length} packages).`);
