type Config = {
  defaultLocale: string;
  apyURL: string;
  maintainer: string;
};

export default {
  defaultLocale: 'eng',
  apyURL: 'https://apertium.org/apy',
  maintainer:
    "<a href='http://wiki.apertium.org/wiki/Apertium' target='_blank' rel='noopener'>Apertium</a>",
} as Config;
