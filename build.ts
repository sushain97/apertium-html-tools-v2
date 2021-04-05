import { promises as fs } from 'fs';
import * as path from 'path';

const DIST = 'dist/';
const STATIC_FILES = ['index.html', 'favicon.ico'];

(async () => {
  await Promise.all(
    [
      ...STATIC_FILES,
      ...(await fs.readdir('src/strings'))
        .filter((f) => f.endsWith('.json'))
        .map((f) => path.join('strings', f)),
    ].map(async (f) => {
      await fs.mkdir(path.dirname(path.join(DIST, f)), { recursive: true });
      await fs.copyFile(path.join('src', f), path.join(DIST, f));
    }),
  );

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
