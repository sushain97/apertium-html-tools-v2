import { Config, Mode } from './src/types';

export default {
  defaultLocale: 'eng',
  apyURL: 'https://apertium.org/apy',
  maintainer:
    "<a href='http://wiki.apertium.org/wiki/Apertium' target='_blank' rel='noopener'>Apertium</a>",
  enabledModes: new Set([Mode.Translation, Mode.Analysis, Mode.Generation]),
} as Config;
