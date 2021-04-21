import './bootstrap.css';
import './app.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import axios from 'axios';

import { LocaleContext, StringsContext } from './context';
import { PRELOADED_STRINGS, Strings, tt, validLocale } from './util/localization';
import { langDirection, toAlpha2Code, toAlpha3Code } from './util/languages';
import Config from '../config';
import { Mode } from './types';
import { apyFetch } from './util';
import { getUrlParam } from './util/url';
import useLocalStorage from './util/useLocalStorage';

import Translator, { Mode as TranslatorMode } from './components/translator';
import Analyzer from './components/Analyzer';
import Footer from './components/footer';
import Generator from './components/Generator';
import LocaleSelector from './components/LocaleSelector';
import Navbar from './components/navbar';
import Sandbox from './components/Sandbox';

// TODO: Add analytics support. If anyone actually wants it?

const Interfaces = {
  [Mode.Translation]: Translator,
  [Mode.Analysis]: Analyzer,
  [Mode.Generation]: Generator,
  [Mode.Sandbox]: Sandbox,
} as Record<Mode, React.ComponentType<unknown>>;

const loadBrowserLocale = (setLocale: React.Dispatch<React.SetStateAction<string>>) => {
  void (async () => {
    let locales: Array<string>;
    try {
      locales = (await apyFetch('getLocale')[1]).data as Array<string>;
    } catch (error) {
      console.warn(`Failed to fetch browser locale, falling back to default ${Config.defaultLocale}`, error);
      return;
    }

    for (let localeGuess of locales) {
      if (localeGuess.indexOf('-') !== -1) {
        localeGuess = localeGuess.split('-')[0];
      }

      const locale = toAlpha3Code(localeGuess);
      if (validLocale(locale)) {
        setLocale(locale);
      }
    }
  })();
};

const App = () => {
  // Locale selection priority:
  // 1. `lang` parameter from URL
  // 2. locale section from URL path
  // 3. `locale` key from LocalStorage
  // 4. browser's preferred locale from APy
  const urlPathMatch = /index\.(\w{3})\.html/.exec(window.location.pathname);
  const urlPathLocale = urlPathMatch && urlPathMatch[1];
  const langParam = getUrlParam('lang');
  const urlQueryLocale = toAlpha3Code(langParam)?.replace('/', '');
  let shouldLoadBrowserLocale = false;
  const [locale, setLocale] = useLocalStorage(
    'locale',
    () => {
      shouldLoadBrowserLocale = true;
      return Config.defaultLocale;
    },
    { overrideValue: urlQueryLocale || urlPathLocale, validateValue: validLocale },
  );
  React.useEffect(() => {
    if (shouldLoadBrowserLocale) {
      loadBrowserLocale(setLocale);
    }
  }, [shouldLoadBrowserLocale, setLocale]);

  // Fetch strings on locale change.
  const [strings, setStrings] = React.useState(PRELOADED_STRINGS);
  React.useEffect(() => {
    if (locale in strings) {
      return;
    }

    void (async () => {
      let localeStrings: Strings;
      try {
        localeStrings = (await axios({ url: `/strings/${locale}.json`, validateStatus: (status) => status == 200 }))
          .data as Strings;
      } catch (error) {
        console.warn(`Failed to fetch strings, falling back to default ${Config.defaultLocale}`, error);
        return;
      }

      setStrings((strings) => ({ ...strings, [locale]: localeStrings }));
    })();
  }, [locale, strings]);

  // Update global strings on locale change.
  React.useEffect(() => {
    const htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.dir = langDirection(locale);
    htmlElement.lang = toAlpha2Code(locale) || locale;

    (document.getElementById('meta-description') as HTMLMetaElement).content = tt('description', locale, strings);

    document.title = tt('title', locale, strings);
  }, [locale, strings]);

  const wrapRef = React.createRef<HTMLDivElement>();
  const pushRef = React.createRef<HTMLDivElement>();

  return (
    <HashRouter>
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
              {Object.values(Mode).map(
                (mode) =>
                  Config.enabledModes.has(mode) && (
                    <Route
                      component={Interfaces[mode]}
                      exact
                      key={mode}
                      path={mode == Config.defaultMode ? ['/', `/${mode}`] : `/${mode}`}
                    />
                  ),
              )}
              {Config.enabledModes.has(Mode.Translation) && (
                <>
                  <Route exact path="/docTranslation">
                    <Translator mode={TranslatorMode.Document} />
                  </Route>
                  <Route exact path="/webpageTranslation">
                    <Translator mode={TranslatorMode.Webpage} />
                  </Route>
                </>
              )}
              <div className="d-block d-sm-none float-left my-2">
                <LocaleSelector setLocale={setLocale} />
              </div>
            </Container>
            <div ref={pushRef} style={{ height: '60px' }} />
          </div>
          <Footer pushRef={pushRef} wrapRef={wrapRef} />
        </LocaleContext.Provider>
      </StringsContext.Provider>
    </HashRouter>
  );
};

ReactDOM.render(<App />, document.getElementById('react-mount'));
