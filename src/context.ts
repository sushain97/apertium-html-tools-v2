import * as React from 'react';

import Config from '../config';
import { PRELOADED_STRINGS } from './util/strings';

const LocaleContext = React.createContext(Config.defaultLocale);
const StringsContext = React.createContext(PRELOADED_STRINGS);

export { LocaleContext, StringsContext };
