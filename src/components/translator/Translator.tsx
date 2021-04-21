/* eslint-disable jsx-a11y/label-has-for */

import './translator.css';

import * as React from 'react';
import { faFile, faLink } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { generatePath } from 'react-router-dom';

import { ChainedPairs, DirectPairs, Mode, Pairs, SrcLangs, TgtLangs, isPair, pairUrlParam } from '.';
import { parentLang, toAlpha3Code } from '../../util/languages';
import Config from '../../../config';
import DocTranslationForm from './DocTranslationForm';
import LanguageSelector from './LanguageSelector';
import TextTranslationForm from './TextTranslationForm';
import WebpageTranslationForm from './WebpageTranslationForm';
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
      return `#${generatePath('/translation')}`;
    case Mode.Document:
      return `#${generatePath('/docTranslation')}`;
    case Mode.Webpage:
      return `#${generatePath('/webpageTranslation')}`;
  }
};

const Translator = ({ mode: initialMode }: { mode?: Mode }): React.ReactElement => {
  const mode: Mode = initialMode || Mode.Text;
  const { t } = useLocalization();

  const [markUnknown, setMarkUnknown] = useLocalStorage('markUnknown', false);
  const [instantTranslation, setInstantTranslation] = useLocalStorage('instantTranslation', true);
  const [translationChaining, setTranslationChaining] = useLocalStorage('translationChaining', false, {
    validateValue: () => Config.translationChaining,
  });

  const pairs = translationChaining ? ChainedPairs : DirectPairs;

  let urlSrcLang = null;
  let urlTgtLang = null;
  const urlParamPair = getUrlParam(pairUrlParam);
  if (urlParamPair) {
    const [src, tgt] = urlParamPair.split('-', 2).map(toAlpha3Code);
    if (src && tgt && isPair(pairs, src, tgt)) {
      urlSrcLang = src;
      urlTgtLang = tgt;
    }
  }

  const [srcLang, realSetSrcLang] = useLocalStorage<string>('srcLang', () => defaultSrcLang(pairs), {
    overrideValue: urlSrcLang,
    validateValue: (l) => l in pairs,
  });
  const [tgtLang, realSetTgtLang] = useLocalStorage<string>(
    'tgtLang',
    () => pairs[srcLang].values().next().value as string,
    {
      overrideValue: urlTgtLang,
      validateValue: (l) => pairs[srcLang].has(l),
    },
  );

  const [recentSrcLangs, setRecentSrcLangs] = useLocalStorage<Array<string>>(
    'recentSrcLangs',
    () => {
      const langs = new Set([srcLang]);
      for (const lang of SrcLangs) {
        if (langs.size == recentLangsCount) {
          break;
        }
        langs.add(lang);
      }
      return Array.from(langs);
    },
    {
      validateValue: (ls) => ls.length == recentLangsCount && ls.every((l) => l in pairs) && ls.includes(srcLang),
    },
  );
  const [recentTgtLangs, setRecentTgtLangs] = useLocalStorage<Array<string>>(
    'recentTgtLangs',
    () => {
      const langs = new Set([tgtLang]);
      for (const lang of pairs[srcLang].values()) {
        if (langs.size == recentLangsCount) {
          break;
        }
        langs.add(lang);
      }
      for (const lang of TgtLangs) {
        if (langs.size == recentLangsCount) {
          break;
        }
        langs.add(lang);
      }
      return Array.from(langs);
    },
    {
      validateValue: (ls) =>
        ls.length == recentLangsCount && ls.some((l) => isPair(pairs, srcLang, l)) && ls.includes(tgtLang),
    },
  );

  const setSrcLang = (lang: string) => {
    realSetSrcLang(lang);
    if (!recentSrcLangs.includes(lang)) {
      setRecentSrcLangs([lang, ...recentSrcLangs].slice(0, recentLangsCount));
    }

    // Unless currently selected destination language works.
    if (!isPair(pairs, lang, tgtLang)) {
      // Prefer a recently selected destination language.
      for (const recentTgtLang of recentTgtLangs) {
        if (isPair(pairs, lang, recentTgtLang)) {
          return setTgtLang(recentTgtLang);
        }
      }

      // Otherwise, pick the first possible destination language.
      setTgtLang((pairs[lang] || new Set()).values().next().value);
    }
  };

  const setTgtLang = (lang: string) => {
    realSetTgtLang(lang);
    if (!recentTgtLangs.includes(lang)) {
      setRecentTgtLangs([lang, ...recentTgtLangs].slice(0, recentLangsCount));
    }
  };

  return (
    <Form aria-label={t('Translate')}>
      <LanguageSelector
        onTranslate={() => window.dispatchEvent(new Event('translate'))}
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
            srcLang={srcLang}
            tgtLang={tgtLang}
          />
          <Row className="mt-2 mb-3">
            <Col className="d-flex d-sm-block mb-2 flex-wrap translation-modes" md="6" xs="12">
              <Button href={urlFromMode(Mode.Document)} variant="secondary">
                <FontAwesomeIcon icon={faFile} /> {t('Translate_Document')}
              </Button>
              <Button href={urlFromMode(Mode.Webpage)} variant="secondary">
                <FontAwesomeIcon icon={faLink} /> {t('Translate_Webpage')}
              </Button>
            </Col>
            <Col className="form-check d-flex flex-column align-items-end justify-content-start w-auto" md="6" xs="12">
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
        <DocTranslationForm cancelLink={urlFromMode(Mode.Text)} srcLang={srcLang} tgtLang={tgtLang} />
      )}
      {mode === Mode.Webpage && (
        <WebpageTranslationForm cancelLink={urlFromMode(Mode.Text)} srcLang={srcLang} tgtLang={tgtLang} />
      )}
    </Form>
  );
};

export default Translator;
