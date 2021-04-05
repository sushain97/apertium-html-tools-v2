import { promises as fs } from 'fs';
import * as path from 'path';

const DIST = 'dist/';
const STATIC_FILES = ['index.html', 'favicon.ico'];

(async () => {
  await Promise.all(STATIC_FILES.map((f) => fs.copyFile(path.join('src', f), path.join(DIST, f))));

  await require('esbuild').build({
    entryPoints: ['src/app.tsx'],
    bundle: true,
    incremental: process.argv.includes('--watch'),
    loader: { '.png': 'dataurl' },
    outfile: path.join(DIST, 'bundle.js'),

    minify: process.argv.includes('--prod'),
    watch: process.argv.includes('--watch'),
  });
})();
