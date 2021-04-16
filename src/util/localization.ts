/* eslint-disable react-hooks/rules-of-hooks */

import * as React from 'react';

import Config from '../../config';
import { LocaleContext, StringsContext } from '../context';
import { languages, toAlpha2Code, toAlpha3Code } from './languages';
import locales from '../strings/locales.json';

export type Strings = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  readonly '@langNames': Record<string, string>;
  readonly [id: string]: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_STRINGS: Strings = (window as any).DEFAULT_STRINGS;

const t = (id: string): string => {
  const strings = React.useContext(StringsContext);
  const locale = React.useContext(LocaleContext);

  let translated = tt(id, locale, strings);
  Object.entries(Config.stringReplacements).forEach(([placeholder, replacement]) => {
    translated = translated.replace(placeholder, replacement);
  });

  return translated;
};

const tLang = (code: string): string => {
  const strings = React.useContext(StringsContext);
  const locale = React.useContext(LocaleContext);

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

const tt = (id: string, locale: string, strings: Record<string, Strings>): string => {
  const localeStrings = strings[locale];
  return (localeStrings ? localeStrings[id] : undefined) || DEFAULT_STRINGS[id] || id;
};

const validLocale = (code: string): boolean => {
  const alpha3Code = toAlpha3Code(code);
  return alpha3Code != null && alpha3Code in locales;
};

export { t, tt, tLang, validLocale, DEFAULT_STRINGS };
