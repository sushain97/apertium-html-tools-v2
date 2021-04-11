export const enum Mode {
  Translation = 'translation',
  Generation = 'generation',
  Analysis = 'analysis',
}

type Config = {
  defaultLocale: string;
  apyURL: string;
  maintainer: string;
  enabledModes: Set<Mode>;
};

export default {
  defaultLocale: 'eng',
  apyURL: 'https://apertium.org/apy',
  maintainer:
    "<a href='http://wiki.apertium.org/wiki/Apertium' target='_blank' rel='noopener'>Apertium</a>",
  enabledModes: new Set([Mode.Translation, Mode.Analysis, Mode.Generation]),
} as Config;
