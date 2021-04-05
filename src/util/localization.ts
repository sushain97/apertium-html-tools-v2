import * as React from 'react';

import { LocaleContext, StringsContext } from '../context';

const DEFAULT_STRINGS = (window as any).DEFAULT_STRINGS;

const t = (id: string) => {
  const strings = React.useContext(StringsContext);
  const locale = React.useContext(LocaleContext);

  const localeStrings = strings[locale];

  return (localeStrings ? localeStrings[id] : undefined) || DEFAULT_STRINGS[id] || id;
};

export { t, DEFAULT_STRINGS };
