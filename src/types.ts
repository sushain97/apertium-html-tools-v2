export enum Mode {
  Translation = 'translation',
  Analysis = 'analysis',
  Generation = 'generation',
  Sandbox = 'sandbox',
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
