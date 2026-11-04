import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Frameworks import the module on the server, where there is no DOM.
test('the module can be imported where there is no DOM', async () => {
  const mod = await import('../dist/pride-badge.mjs');
  assert.equal(typeof mod.PrideBadge, 'function');
});

test('the npm package ships only dist, README, LICENSE and package.json', () => {
  const out = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' }));
  const files = out[0].files.map((f: { path: string }) => f.path).sort();
  assert.deepEqual(files, ['LICENSE', 'README.md', 'dist/pride-badge.d.ts', 'dist/pride-badge.js', 'dist/pride-badge.mjs', 'package.json']);
});

test('installs on any Node version (it runs in the browser)', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.engines, undefined);
  assert.equal(pkg.types, 'dist/pride-badge.d.ts');
});

test('TypeScript knows the element and its class', () => {
  execFileSync('npx', ['tsc', '--ignoreConfig', '--noEmit', '--strict', '--target', 'es2022', '--module', 'esnext', '--moduleResolution', 'bundler', '--lib', 'es2022,dom', '--types', '', 'test/types/use.ts'], { encoding: 'utf8' });
});
