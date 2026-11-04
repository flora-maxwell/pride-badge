// Two files from one source: a classic script for the CDN (<script src>) and an ES module for npm,
// both opening with the MIT notice; plus the hand-written types.
import { copyFile, readFile } from 'node:fs/promises';
import { build } from 'esbuild';

const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const banner = { js: `/*! pride-badge ${version} | MIT © Flora Maxwell | flag CC0 (design Valentino Vecchietti) | https://github.com/flora-maxwell/pride-badge */` };
const common = { entryPoints: ['src/index.ts'], bundle: true, minify: true, target: 'es2020', legalComments: 'none', banner };
await build({ ...common, format: 'iife', outfile: 'dist/pride-badge.js' });
await build({ ...common, format: 'esm', outfile: 'dist/pride-badge.mjs' });
await copyFile('src/pride-badge.d.ts', 'dist/pride-badge.d.ts');
