import { promises as fs } from 'fs';
import * as path from 'path';

const DIST = 'dist/';

(async () => {
  await fs.copyFile('src/index.html', path.join(DIST, 'index.html'));
  await require('esbuild').build({
    entryPoints: ['src/app.tsx'],
    bundle: true,
    incremental: process.argv.includes('--watch'),
    outfile: path.join(DIST, 'bundle.js'),
  });
})();
