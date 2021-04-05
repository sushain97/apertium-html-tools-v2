import { promises as fs } from 'fs';
import * as path from 'path';
import axios from 'axios';

import Config from './config';

const DIST = 'dist/';
const STATIC_FILES = ['index.html', 'favicon.ico'];

const prod = process.argv.includes('--prod');
const watch = process.argv.includes('--watch');

(async () => {
  await Promise.all(
    (await fs.readdir('src/strings'))
      .filter((f) => f.endsWith('.json') && f != 'locales.json')
      .map(async (f) => {
        const response = await axios({
          url: `${Config.apyURL}/listLanguageNames?locale=${path.parse(f).name}`,
          validateStatus: (status) => status == 200,
        });

        const inPath = path.join('src/strings', f);
        const outPath = path.join(DIST, 'strings', f);

        await fs.mkdir(path.dirname(outPath), { recursive: true });

        const outData = JSON.parse(await fs.readFile(inPath, 'utf-8'));
        delete outData['@metadata'];
        outData['@langNames'] = response.data;

        await fs.writeFile(outPath, JSON.stringify(outData));
      }),
  );

  await Promise.all(STATIC_FILES.map((f) => fs.copyFile(path.join('src', f), path.join(DIST, f))));

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
