/* eslint-disable jsx-a11y/label-has-for */

import './translator.css';

import * as React from 'react';
import { faFile, faLink } from '@fortawesome/free-solid-svg-icons';
import { generatePath, useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import { ChainedPairs, DirectPairs, Mode, Pairs, SrcLangs, TgtLangs, TranslateEvent, isPair, pairUrlParam } from '.';
import DocTranslationForm, { Path as DocTranslationPath } from './DocTranslationForm';
import TextTranslationForm, { Path as TextTranslationPath } from './TextTranslationForm';
import WebpageTranslationForm, { Path as WebpageTranslationPath } from './WebpageTranslationForm';
import { parentLang, toAlpha3Code } from '../../util/languages';
import Config from '../../../config';
import LanguageSelector from './LanguageSelector';
import { getUrlParam } from '../../util/url';
import useLocalStorage from '../../util/useLocalStorage';
import { useLocalization } from '../../util/localization';

const recentLangsCount = 3;

const defaultSrcLang = (pairs: Pairs): string => {
  const validSrcLang = (code: string) => pairs[toAlpha3Code(code) || code];

  const convertBCP47LangCode = (code: string): string => {
    // First, convert variant format.
    // Then, BCP 47 prefers shortest code, we prefer longest.
    return toAlpha3Code(code.replace('-', '_')) || code;
  };

  // Chrome, Mozilla and Safari
  const browserLangs = window.navigator.languages;
  if (browserLangs) {
    for (let i = 0; i < browserLangs.length; ++i) {
      const isoLang = convertBCP47LangCode(browserLangs[i]);
      if (validSrcLang(isoLang)) {
        return isoLang;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { navigator }: { navigator: { userlanguage?: string; browserlanguage?: string; language?: string } } = window;
  const ieLang = navigator.userlanguage || navigator.browserlanguage || navigator.language;
  if (ieLang) {
    const ieIsoLang = convertBCP47LangCode(ieLang);
    if (validSrcLang(ieIsoLang)) {
      return ieIsoLang;
    } else if (validSrcLang(parentLang(ieIsoLang))) {
      return parentLang(ieIsoLang);
    }
  }

  // Fallback to first available overall pair.
  for (const srcLang in pairs) {
    return srcLang;
  }

  throw new Error('No pairs available');
};

const urlFromMode = (mode: Mode): string => {
  switch (mode) {
    case Mode.Text:
      return generatePath(TextTranslationPath);
    case Mode.Document:
      return generatePath(DocTranslationPath);
    case Mode.Webpage:
      return generatePath(WebpageTranslationPath);
  }
};

type WithSrcLangsProps = {
  srcLang: string;
  setSrcLang: (lang: string) => void;
  recentSrcLangs: Array<string>;
  setRecentSrcLangs: (langs: Array<string>) => void;
};

const WithSrcLang = ({
  pairs,
  urlSrcLang,
  children,
}: {
  pairs: Pairs;
  urlSrcLang: string | null;
  children: (props: WithSrcLangsProps) => React.ReactElement;
}): React.ReactElement => {
  const [srcLang, realSetSrcLang] = useLocalStorage<string>('srcLang', () => defaultSrcLang(pairs), {
    overrideValue: urlSrcLang,
    validateValue: (l) => l in pairs,
  });

  const [recentSrcLangs, setRecentSrcLangs] = useLocalStorage<Array<string>>(
    'recentSrcLangs',
    () => {
      const langs = new Set([srcLang]);
      for (const lang of SrcLangs) {
        if (langs.size === recentLangsCount) {
          break;
        }
        langs.add(lang);
      }
      return Array.from(langs);
    },
    {
      validateValue: (ls) => ls.length === recentLangsCount && ls.every((l) => l in pairs) && ls.includes(srcLang),
    },
  );

  const setSrcLang = React.useCallback(
    (lang: string) => {
      realSetSrcLang(lang);
      if (!recentSrcLangs.includes(lang)) {
        setRecentSrcLangs([lang, ...recentSrcLangs].slice(0, recentLangsCount));
      }
    },
    [realSetSrcLang, recentSrcLangs, setRecentSrcLangs],
  );

  return children({ srcLang, setSrcLang, recentSrcLangs, setRecentSrcLangs });
};

type WithTgtLangsProps = {
  tgtLang: string;
  setTgtLang: (lang: string) => void;
  recentTgtLangs: Array<string>;
  setRecentTgtLangs: (langs: Array<string>) => void;
};

const WithTgtLang = ({
  pairs,
  srcLang,
  urlTgtLang,
  children,
}: {
  pairs: Pairs;
  srcLang: string;
  urlTgtLang: string | null;
  children: (props: WithTgtLangsProps) => React.ReactElement;
}): React.ReactElement => {
  const [tgtLang, realSetTgtLang] = useLocalStorage<string>(
    'tgtLang',
    () => pairs[srcLang].values().next().value as string,
    {
      overrideValue: urlTgtLang,
      validateValue: (l) => pairs[srcLang].has(l),
    },
  );

  const [recentTgtLangs, setRecentTgtLangs] = useLocalStorage<Array<string>>(
    'recentTgtLangs',
    () => {
      const langs = new Set([tgtLang]);
      for (const lang of pairs[srcLang].values()) {
        if (langs.size === recentLangsCount) {
          break;
        }
        langs.add(lang);
      }
      for (const lang of TgtLangs) {
        if (langs.size === recentLangsCount) {
          break;
        }
        langs.add(lang);
      }
      return Array.from(langs);
    },
    {
      validateValue: (ls) =>
        ls.length === recentLangsCount && ls.some((l) => isPair(pairs, srcLang, l)) && ls.includes(tgtLang),
    },
  );

  const setTgtLang = React.useCallback(
    (lang: string) => {
      realSetTgtLang(lang);
      if (!recentTgtLangs.includes(lang)) {
        setRecentTgtLangs([lang, ...recentTgtLangs].slice(0, recentLangsCount));
      }
    },
    [realSetTgtLang, recentTgtLangs, setRecentTgtLangs],
  );

  React.useEffect(() => {
    // This will happen in a couple situations:
    // 1. User changes source language and current target no longer works.
    // 2. User disables chained translation.
    if (!isPair(pairs, srcLang, tgtLang)) {
      // Prefer a recently selected target language.
      for (const recentTgtLang of recentTgtLangs) {
        if (isPair(pairs, srcLang, recentTgtLang)) {
          return setTgtLang(recentTgtLang);
        }
      }

      // Otherwise, pick the first possible target language.
      setTgtLang((pairs[srcLang] || new Set()).values().next().value);
    }
  }, [pairs, recentTgtLangs, setTgtLang, srcLang, tgtLang]);

  return children({ tgtLang, setTgtLang, recentTgtLangs, setRecentTgtLangs });
};

const Translator = ({ mode: initialMode }: { mode?: Mode }): React.ReactElement => {
  const mode: Mode = initialMode || Mode.Text;

  const { t } = useLocalization();
  const history = useHistory();

  const [loading, setLoading] = React.useState(false);

  const [markUnknown, setMarkUnknown] = useLocalStorage('markUnknown', false);
  const [instantTranslation, setInstantTranslation] = useLocalStorage('instantTranslation', true);
  const [translationChaining, setTranslationChaining] = useLocalStorage('translationChaining', false, {
    validateValue: () => Config.translationChaining,
  });

  const pairs = translationChaining && mode === Mode.Text ? ChainedPairs : DirectPairs;

  let urlSrcLang = null;
  let urlTgtLang: string | null = null;
  const urlParamPair = getUrlParam(history.location.search, pairUrlParam);
  if (urlParamPair) {
    const [src, tgt] = urlParamPair.split('-', 2).map(toAlpha3Code);
    if (src && tgt && isPair(pairs, src, tgt)) {
      urlSrcLang = src;
      urlTgtLang = tgt;
    }
  }

  return (
    <Form
      aria-label={t('Translate')}
      onSubmit={(event) => {
        window.dispatchEvent(new Event(TranslateEvent));
        event.preventDefault();
      }}
    >
      <WithSrcLang pairs={pairs} urlSrcLang={urlSrcLang}>
        {({ srcLang, recentSrcLangs, setSrcLang }: WithSrcLangsProps) => (
          <WithTgtLang pairs={pairs} srcLang={srcLang} urlTgtLang={urlTgtLang}>
            {({ tgtLang, setTgtLang, recentTgtLangs }: WithTgtLangsProps) => (
              <>
                <LanguageSelector
                  detectLangEnabled={mode !== Mode.Text}
                  loading={loading}
                  onTranslate={() => window.dispatchEvent(new Event(TranslateEvent))}
                  pairs={pairs}
                  recentSrcLangs={recentSrcLangs}
                  recentTgtLangs={recentTgtLangs}
                  setSrcLang={setSrcLang}
                  setTgtLang={setTgtLang}
                  srcLang={srcLang}
                  tgtLang={tgtLang}
                />
                {(mode === Mode.Text || !mode) && (
                  <>
                    <TextTranslationForm
                      instantTranslation={instantTranslation}
                      markUnknown={markUnknown}
                      setLoading={setLoading}
                      srcLang={srcLang}
                      tgtLang={tgtLang}
                    />
                    <Row className="mt-2 mb-3">
                      <Col className="d-flex d-sm-block flex-wrap translation-modes" md="6" xs="12">
                        <Button
                          className="mb-2"
                          onClick={() => history.push(urlFromMode(Mode.Document))}
                          variant="secondary"
                        >
                          <FontAwesomeIcon icon={faFile} /> {t('Translate_Document')}
                        </Button>
                        <Button
                          className="mb-2"
                          onClick={() => history.push(urlFromMode(Mode.Webpage))}
                          variant="secondary"
                        >
                          <FontAwesomeIcon icon={faLink} /> {t('Translate_Webpage')}
                        </Button>
                      </Col>
                      <Col
                        className="form-check d-flex flex-column align-items-end justify-content-start w-auto"
                        md="6"
                        xs="12"
                      >
                        <label className="mb-1">
                          <input
                            checked={markUnknown}
                            onChange={({ currentTarget }) => setMarkUnknown(currentTarget.checked)}
                            type="checkbox"
                          />{' '}
                          <span>{t('Mark_Unknown_Words')}</span>
                        </label>
                        <label className="mb-1">
                          <input
                            checked={instantTranslation}
                            onChange={({ currentTarget }) => setInstantTranslation(currentTarget.checked)}
                            type="checkbox"
                          />{' '}
                          <span>{t('Instant_Translation')}</span>
                        </label>
                        {Config.translationChaining && (
                          <label className="mb-1">
                            <input
                              checked={translationChaining}
                              onChange={({ currentTarget }) => setTranslationChaining(currentTarget.checked)}
                              type="checkbox"
                            />{' '}
                            <span dangerouslySetInnerHTML={{ __html: t('Multi_Step_Translation') }} />
                          </label>
                        )}
                      </Col>
                    </Row>
                  </>
                )}
                {mode === Mode.Document && (
                  <DocTranslationForm
                    onCancel={() => history.push(urlFromMode(Mode.Text))}
                    setLoading={setLoading}
                    srcLang={srcLang}
                    tgtLang={tgtLang}
                  />
                )}
                {mode === Mode.Webpage && (
                  <WebpageTranslationForm
                    onCancel={() => history.push(urlFromMode(Mode.Text))}
                    setLoading={setLoading}
                    srcLang={srcLang}
                    tgtLang={tgtLang}
                  />
                )}
              </>
            )}
          </WithTgtLang>
        )}
      </WithSrcLang>
    </Form>
  );
};

export default Translator;
