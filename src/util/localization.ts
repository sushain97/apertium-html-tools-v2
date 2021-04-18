import * as React from 'react';

import { LocaleContext, StringsContext } from '../context';
import { languages, toAlpha2Code, toAlpha3Code } from './languages';
import Config from '../../config';
import locales from '../strings/locales.json';

export type Strings = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  readonly '@langNames': Record<string, string>;
  readonly [id: string]: string;
};

// eslint-disable-next-line
export const DEFAULT_STRINGS: Strings = (window as any).DEFAULT_STRINGS;

const t = (locale: string, strings: Record<string, Strings>): ((id: string) => string) => {
  return (id: string) => tt(id, locale, strings);
};

export const tt = (id: string, locale: string, strings: Record<string, Strings>): string => {
  const localeStrings = strings[locale];
  let translated = (localeStrings ? localeStrings[id] : undefined) || DEFAULT_STRINGS[id] || id;
  Object.entries(Config.stringReplacements).forEach(([placeholder, replacement]) => {
    translated = translated.replace(placeholder, replacement);
  });
  return translated;
};

const tLang = (locale: string, strings: Record<string, Strings>) => {
  return (id: string) => ttLang(id, locale, strings);
};

const ttLang = (code: string, locale: string, strings: Record<string, Strings>): string => {
  const alpha2Code = toAlpha2Code(code);

  const localeNames = strings[locale] && strings[locale]['@langNames'];
  if (localeNames) {
    const localeName = localeNames[code] || (alpha2Code && localeNames[alpha2Code]);
    if (localeName) {
      return localeName;
    }
  }

  const defaultNames = DEFAULT_STRINGS['@langNames'];
  if (defaultNames[code]) {
    const defaultName = defaultNames[code] || (alpha2Code && defaultNames[alpha2Code]);
    if (defaultName) {
      return defaultName;
    }
  }

  return (alpha2Code && languages[alpha2Code]) || code;
};

export const useLocalization = (): { t: (id: string) => string; tLang: (code: string) => string } => {
  const strings = React.useContext(StringsContext);
  const locale = React.useContext(LocaleContext);

  return { t: t(locale, strings), tLang: tLang(locale, strings) };
};

export const validLocale = (code: string): boolean => {
  const alpha3Code = toAlpha3Code(code);
  return alpha3Code != null && alpha3Code in locales;
};
