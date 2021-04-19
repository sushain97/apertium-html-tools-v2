import * as child_process from 'child_process';
import * as path from 'path';
import { promises as fs } from 'fs';

import * as esbuild from 'esbuild';
import axios, { AxiosResponse } from 'axios';

import { languages, parentLang, toAlpha2Code, toAlpha3Code } from './src/util/languages';
import Config from './config';
import locales from './src/strings/locales.json';

const DIST = 'dist/';
const STATIC_FILES = ['favicon.ico'];

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

void (async () => {
  let defaultStrings: unknown;

  const indexHtml = await fs.readFile('src/index.html', 'utf-8');

  const pairs = ((await apyGet(`list`, { q: 'pairs' })).data as {
    responseData: Array<{
      sourceLanguage: string;
      targetLanguage: string;
    }>;
  }).responseData;
  const analyzers = (await apyGet(`list`, { q: 'analyzers' })).data as Record<string, string>;
  const generators = (await apyGet(`list`, { q: 'generators' })).data as Record<string, string>;

  let allLangs: Array<string | null> = [
    ...([] as Array<string>).concat(
      ...pairs.map(({ sourceLanguage, targetLanguage }) => [sourceLanguage, targetLanguage]),
    ),
    ...Object.keys(analyzers),
    ...Object.keys(generators),
    ...Object.keys(languages),
    ...Object.keys(locales),
  ].filter(Boolean);
  allLangs = [...allLangs, ...allLangs.map((l) => (l ? parentLang(l) : l))];
  allLangs = [...allLangs, ...allLangs.map(toAlpha2Code)];
  allLangs = [...allLangs, ...allLangs.map(toAlpha3Code)];
  const allLangsSet = new Set(allLangs.filter(Boolean));

  const localeStrings = (await Promise.all(
    (await fs.readdir('src/strings'))
      .filter((f) => f.endsWith('.json') && f != 'locales.json')
      .map(async (f) => {
        const locale = path.parse(f).name;
        const response = await apyGet('listLanguageNames', { locale });
        const allLangNames = response.data as Record<string, string>;

        const srcPath = path.join('src/strings', f);
        const distPath = path.join(DIST, 'strings', f);

        await fs.mkdir(path.dirname(distPath), { recursive: true });

        const strings = JSON.parse(await fs.readFile(srcPath, 'utf-8')) as Record<string, unknown>;
        delete strings['@metadata'];

        const langNames: Record<string, string> = {};
        for (const lang of Object.keys(allLangNames)) {
          if (allLangsSet.has(lang)) {
            langNames[lang] = allLangNames[lang];
          }
        }
        strings['@langNames'] = langNames;

        if (f === `${Config.defaultLocale}.json`) {
          defaultStrings = strings;
        }

        await fs.writeFile(distPath, JSON.stringify(strings));

        return [locale, strings];
      }),
  )) as Array<[string, unknown]>;

  await Promise.all(
    localeStrings.map(([locale, strings]) =>
      fs.writeFile(
        path.join(DIST, `index.${locale}.html`),
        indexHtml.replace(
          '{{PRELOADED_STRINGS}}',
          JSON.stringify({ [Config.defaultLocale]: defaultStrings, [locale]: strings }),
        ),
      ),
    ),
  );

  await Promise.all(STATIC_FILES.map((f) => fs.copyFile(path.join('src', f), path.join(DIST, f))));

  await fs.writeFile(
    path.join(DIST, 'index.html'),
    indexHtml.replace('{{PRELOADED_STRINGS}}', JSON.stringify({ [Config.defaultLocale]: defaultStrings })),
  );

  // TODO: Switch `yarn serve` to use `esbuild.serve` which prevents stale
  // responses and minimizes FS writes.
  await esbuild.build({
    entryPoints: ['src/app.tsx'],
    bundle: true,
    metafile: true,
    loader: { '.embed.png': 'dataurl', '.png': 'file', '.gif': 'file', '.jpg': 'file' },
    outfile: path.join(DIST, 'bundle.js'),

    define: {
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
                void (async () => {
                  await fs.writeFile('meta.json', JSON.stringify(result.metafile));
                })();
              }
            }
          },
        }
      : undefined,
  });
})();
