import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = process.cwd();
const PACKAGES_DIR = resolve(ROOT, 'packages');

const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const packages = packageDirs.map((dirName) => {
  const file = join(PACKAGES_DIR, dirName, 'package.json');
  const content = JSON.parse(readFileSync(file, 'utf8'));
  return {
    dirName,
    file,
    name: content.name,
    version: content.version,
    manifest: content,
  };
});

const workspaceByName = new Map(packages.map((pkg) => [pkg.name, pkg]));
const errors = [];

for (const pkg of packages) {
  verifyInternalRanges(pkg, 'dependencies');
  verifyInternalRanges(pkg, 'devDependencies');
  verifyInternalRanges(pkg, 'optionalDependencies');
  verifyPeerRanges(pkg);
}

if (errors.length > 0) {
  console.error('Workspace version policy verification failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Workspace version policy verified (${packages.length} packages).`);

function verifyInternalRanges(pkg, field) {
  const deps = pkg.manifest[field];
  if (!deps || typeof deps !== 'object') return;

  for (const [depName, depRange] of Object.entries(deps)) {
    if (!workspaceByName.has(depName)) continue;
    if (depRange !== 'workspace:*') {
      errors.push(`${pkg.name} ${field}.${depName} should be "workspace:*" (found "${depRange}").`);
    }
  }
}

function verifyPeerRanges(pkg) {
  const peerDeps = pkg.manifest.peerDependencies;
  if (!peerDeps || typeof peerDeps !== 'object') return;

  for (const [depName, depRange] of Object.entries(peerDeps)) {
    const depPkg = workspaceByName.get(depName);
    if (!depPkg) continue;
    const expected = `~${depPkg.version}`;
    if (depRange !== expected) {
      errors.push(`${pkg.name} peerDependencies.${depName} should be "${expected}" (found "${depRange}").`);
    }
  }
}
