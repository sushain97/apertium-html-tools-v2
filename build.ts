import * as child_process from 'child_process';
import * as path from 'path';
import { promises as fs } from 'fs';

import * as esbuild from 'esbuild';
import axios, { AxiosResponse } from 'axios';

import Config from './config';

const DIST = 'dist/';
const STATIC_FILES = ['index.html', 'favicon.ico'];

const prod = process.argv.includes('--prod');
const watch = process.argv.includes('--watch');

const version = child_process.execSync('git describe --tags --always').toString().trim();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apyGet = async (path: string, params: unknown): Promise<AxiosResponse<any>> =>
  await axios({
    url: `${Config.apyURL}/${path}`,
    params,
    validateStatus: (status) => status == 200,
  });

(async () => {
  let defaultStrings;

  const pairs = (await apyGet(`list`, { q: 'pairs' })).data['responseData'];
  const analyzers = (await apyGet(`list`, { q: 'analyzers' })).data;
  const generators = (await apyGet(`list`, { q: 'generators' })).data;

  await Promise.all(
    (await fs.readdir('src/strings'))
      .filter((f) => f.endsWith('.json') && f != 'locales.json')
      .map(async (f) => {
        const response = await apyGet('listLanguageNames', { locale: path.parse(f).name });

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
    metafile: true,
    loader: { '.embed.png': 'dataurl', '.png': 'file', '.gif': 'file', '.jpg': 'file' },
    outfile: path.join(DIST, 'bundle.js'),

    define: {
      'window.DEFAULT_STRINGS': JSON.stringify(defaultStrings),
      'window.VERSION': JSON.stringify(version),

      'window.PAIRS': JSON.stringify(pairs),
      'window.ANALYZERS': JSON.stringify(analyzers),
      'window.GENERATORS': JSON.stringify(generators),
    },

    minify: prod,
    sourcemap: prod,

    incremental: watch,
    watch: watch
      ? {
          onRebuild(error: esbuild.BuildFailure | null, result: esbuild.BuildResult | null) {
            if (error) console.error('❌ watch build failed');
            else {
              console.log('✅ watch build succeeded');
              if (result) {
                (async () => {
                  await fs.writeFile('meta.json', JSON.stringify(result.metafile));
                })();
              }
            }
          },
        }
      : undefined,
  });
})();
