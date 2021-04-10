import { promises as fs } from 'fs';
import * as path from 'path';

import axios from 'axios';
import * as esbuild from 'esbuild';

import Config from './config';

const DIST = 'dist/';
const STATIC_FILES = ['index.html', 'favicon.ico'];

const prod = process.argv.includes('--prod');
const watch = process.argv.includes('--watch');

(async () => {
  let defaultStrings;

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

        if (f === `${Config.defaultLocale}.json`) {
          defaultStrings = outData;
        }

        await fs.writeFile(outPath, JSON.stringify(outData));
      }),
  );

  await Promise.all(STATIC_FILES.map((f) => fs.copyFile(path.join('src', f), path.join(DIST, f))));

  await esbuild.build({
    entryPoints: ['src/app.tsx'],
    bundle: true,
    loader: { '.embed.png': 'dataurl', '.png': 'file', '.gif': 'file', '.jpg': 'file' },
    outfile: path.join(DIST, 'bundle.js'),

    define: {
      'window.DEFAULT_STRINGS': JSON.stringify(defaultStrings),
    },

    minify: prod,
    sourcemap: prod,

    incremental: watch,
    watch: watch
      ? {
          onRebuild(error: esbuild.BuildFailure | null, result: esbuild.BuildResult | null) {
            if (error) console.error('❌ watch build failed');
            else console.log('✅ watch build succeeded');
          },
        }
      : undefined,
  });
})();
