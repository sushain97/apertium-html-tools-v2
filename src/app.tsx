import './bootstrap.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Config from '../config';
import { get } from './util/jsonp';
import { iso639Codes, iso639CodesInverse } from './util/languages';
import useLocalStorage from './util/use-local-storage';
import Navbar from './components/navbar';
import { LocaleContext } from './context';

const loadDefaultLocale = (setLocale: React.Dispatch<React.SetStateAction<string>>) => {
  React.useEffect(() => {
    (async () => {
      let locales: Array<string>;
      try {
        locales = (await get(`${Config.apyURL}/getLocale`)).data;
      } catch (error) {
        console.warn(
          `Failed to fetch browser locale, falling back to default ${Config.defaultLocale}: ${error}`,
        );
        return;
      }

      for (let localeGuess of locales) {
        if (localeGuess.indexOf('-') !== -1) {
          localeGuess = localeGuess.split('-')[0];
        }

        if (localeGuess in iso639Codes) {
          setLocale(localeGuess);
          return;
        } else if (localeGuess in iso639CodesInverse) {
          setLocale(iso639CodesInverse[localeGuess]);
          return;
        }
      }
    })();
  }, []);
};

const App = () => {
  // Attempt to load locale from LocalStorage. If that fails, use the default
  // unless/until we're able to fetch the browser's preferred locale from APy.
  let localeDefault = false;
  const [locale, setLocale] = useLocalStorage('locale', () => {
    localeDefault = true;
    return Config.defaultLocale;
  });
  if (localeDefault) {
    loadDefaultLocale(setLocale);
  }

  return (
    <LocaleContext.Provider value={locale}>
      <Navbar setLocale={setLocale} />
    </LocaleContext.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('react-mount'));
