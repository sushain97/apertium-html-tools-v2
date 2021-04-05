import { promises as fs } from 'fs';
import * as path from 'path';

const DIST = 'dist/';
const STATIC_FILES = ['index.html', 'favicon.ico'];

const prod = process.argv.includes('--prod');
const watch = process.argv.includes('--watch');

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
    loader: { '.png': 'dataurl' },
    outfile: path.join(DIST, 'bundle.js'),

    minify: prod,
    sourcemap: prod,

    incremental: watch,
    watch,
  });
})();
