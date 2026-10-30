import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';

await mkdir('dist/viewer', { recursive: true });
await build({ entryPoints: ['src/server.ts'], outfile: 'dist/server.js', bundle: true,
  platform: 'node', target: 'node24', format: 'esm' });
await build({ entryPoints: ['viewer/main.ts'], outfile: 'dist/viewer/app.js', bundle: true,
  platform: 'browser', target: 'es2022', format: 'esm', minify: true, legalComments: 'eof' });
await copyFile('viewer/index.html', 'dist/viewer/index.html');
await copyFile('viewer/style.css', 'dist/viewer/style.css');
console.log('Built local server and self-contained Phaser viewer.');
