import * as React from 'react';

import Config from '../config';
import { DEFAULT_STRINGS } from './util/localization';

const LocaleContext = React.createContext(Config.defaultLocale);
const StringsContext = React.createContext({ [Config.defaultLocale]: DEFAULT_STRINGS });

export { LocaleContext, StringsContext };
