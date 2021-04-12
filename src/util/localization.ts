import * as React from 'react';

import Config from '../../config';
import { LocaleContext, StringsContext } from '../context';
import { languages, toAlpha2Code } from './languages';

type Strings = {
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

  return tt(id, locale, strings).replace('{{maintainer}}', Config.maintainer);
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

export { t, tt, tLang, DEFAULT_STRINGS };
