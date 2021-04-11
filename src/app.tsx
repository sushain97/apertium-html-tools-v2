import './bootstrap.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as queryString from 'query-string';
import axios from 'axios';
import Container from 'react-bootstrap/Container';

import Config from '../config';
import { LocaleContext, StringsContext } from './context';

import { get } from './util/jsonp';
import { langDirection, toAlpha3Code } from './util/languages';
import useLocalStorage from './util/use-local-storage';
import { DEFAULT_STRINGS, tt } from './util/localization';

import Navbar from './components/navbar';
import Footer from './components/footer';
import LocaleSelector from './components/LocaleSelector';

const loadBrowserLocale = (setLocale: React.Dispatch<React.SetStateAction<string>>) => {
  React.useEffect(() => {
    (async () => {
      let locales: Array<string>;
      try {
        locales = (await get(`${Config.apyURL}/getLocale`)).data as Array<string>;
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

        const locale = toAlpha3Code(localeGuess);
        if (locale) {
          setLocale(locale);
        }
      }
    })();
  }, []);
};

const App = () => {
  // Locale selection priority:
  // 1. `lang` parameter from URL
  // 2. `locale` key from LocalStorage
  // 3. browser's preferred locale from APy
  const langParam = queryString.parse(location.search)['lang'];
  const urlLocale =
    langParam &&
    toAlpha3Code(langParam instanceof Array ? langParam[0] : langParam)?.replace('/', '');
  let shouldLoadBrowserLocale = false;
  const [locale, setLocale] = useLocalStorage(
    'locale',
    () => {
      shouldLoadBrowserLocale = true;
      return Config.defaultLocale;
    },
    urlLocale,
  );
  if (shouldLoadBrowserLocale) {
    loadBrowserLocale(setLocale);
  }

  // Fetch strings on locale change.
  const [strings, setStrings] = React.useState({ [Config.defaultLocale]: DEFAULT_STRINGS });
  React.useEffect(() => {
    (async () => {
      let localeStrings;
      try {
        localeStrings = (
          await axios({ url: `/strings/${locale}.json`, validateStatus: (status) => status == 200 })
        ).data;
      } catch (error) {
        console.warn(
          `Failed to fetch strings, falling back to default ${Config.defaultLocale}: ${error}`,
        );
        return;
      }

      setStrings({ ...strings, [locale]: localeStrings });
    })();
  }, [locale]);

  // Update global strings on locale change.
  React.useEffect(() => {
    (async () => {
      document.getElementsByTagName('html')[0].dir = langDirection(locale);
      document.title = tt('title', locale, strings);
    })();
  }, [locale, strings]);

  const wrapRef = React.createRef<HTMLDivElement>();
  const pushRef = React.createRef<HTMLDivElement>();

  return (
    <StringsContext.Provider value={strings}>
      <LocaleContext.Provider value={locale}>
        <div
          ref={wrapRef}
          style={{
            height: 'auto !important',
            margin: '0 auto -60px',
            minHeight: '99.5%',
          }}
        >
          <Navbar setLocale={setLocale} />
          <Container>
            <div className="d-block d-sm-none float-left my-2">
              <LocaleSelector setLocale={setLocale} />
            </div>
          </Container>
          <div ref={pushRef} style={{ height: '60px' }} />
        </div>
        <Footer wrapRef={wrapRef} pushRef={pushRef} />
      </LocaleContext.Provider>
    </StringsContext.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('react-mount'));
