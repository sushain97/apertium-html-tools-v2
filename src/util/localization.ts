import * as React from 'react';

import Config from '../../config';
import { LocaleContext, StringsContext } from '../context';

type Strings = { [id: string]: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_STRINGS: Strings = (window as any).DEFAULT_STRINGS;

const t = (id: string): string => {
  const strings = React.useContext(StringsContext);
  const locale = React.useContext(LocaleContext);

  return tt(id, locale, strings).replace('{{maintainer}}', Config.maintainer);
};

const tt = (id: string, locale: string, strings: { [locale: string]: Strings }): string => {
  const localeStrings = strings[locale];
  return (localeStrings ? localeStrings[id] : undefined) || DEFAULT_STRINGS[id] || id;
};

export { t, tt, DEFAULT_STRINGS };
