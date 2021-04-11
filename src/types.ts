export const enum Mode {
  Translation = 'translation',
  Generation = 'generation',
  Analysis = 'analysis',
}

export type Config = {
  defaultLocale: string;
  apyURL: string;
  maintainer: string;
  enabledModes: Set<Mode>;
};
