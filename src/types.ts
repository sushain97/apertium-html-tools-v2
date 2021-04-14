export enum Mode {
  Translation = 'translation',
  Generation = 'generation',
  Analysis = 'analysis',
}

export type Config = {
  defaultLocale: string;
  apyURL: string;
  maintainer: string;

  defaultMode: Mode;
  enabledModes: Set<Mode>;

  subtitle?: string;
  subtitleColor?: string;
};
