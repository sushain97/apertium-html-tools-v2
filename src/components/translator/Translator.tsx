/* eslint-disable jsx-a11y/label-has-for */

import './translator.css';

import * as React from 'react';
import axios, { CancelTokenSource } from 'axios';
import { faFile, faLink } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import { ChainedPairs, DirectPairs, Pairs, SrcLangs, TgtLangs, isPair } from '.';
import { MaxURLLength, buildNewUrl, getUrlParam } from '../../util/url';
import { parentLang, toAlpha3Code } from '../../util/languages';
import Config from '../../../config';
import LanguageSelector from './LanguageSelector';
import TextTranslationForm from './TextTranslationForm';
import { apyFetch } from '../../util';
import useLocalStorage from '../../util/useLocalStorage';
import { useLocalization } from '../../util/localization';

const recentLangsCount = 3;
const pairUrlParam = 'dir';
const textUrlParam = 'q';

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

const Translator = (): React.ReactElement => {
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

  const [srcText, setSrcText] = useLocalStorage('srcText', '', { overrideValue: getUrlParam(textUrlParam) });
  const [tgtText, setTgtText] = React.useState('');

  React.useEffect(() => {
    const pair = `${srcLang}-${tgtLang}`;
    let newUrl = buildNewUrl({ [pairUrlParam]: pair, [textUrlParam]: srcText });
    if (newUrl.length > MaxURLLength) {
      newUrl = buildNewUrl({ [pairUrlParam]: pair });
    }
    window.history.replaceState({}, document.title, newUrl);
  }, [srcLang, tgtLang, srcText]);

  const [error, setError] = React.useState(false);
  const translationRef = React.useRef<CancelTokenSource | null>(null);

  const translateText = React.useCallback(
    async ({ srcText, srcLang, tgtLang }: { srcText: string; srcLang: string; tgtLang: string }) => {
      if (srcText.trim().length == 0) {
        setTgtText('');
        return;
      }

      translationRef.current?.cancel();
      translationRef.current = null;

      const [ref, request] = apyFetch('translate', {
        q: srcText,
        langpair: `${srcLang}|${tgtLang}`,
        markUnknown: markUnknown ? 'yes' : 'no',
      });
      translationRef.current = ref;

      try {
        const response = (await request).data as {
          responseData: { translatedText: string };
          responseDetails: unknown;
          responseStatus: number;
        };
        setTgtText(response.responseData.translatedText);
        setError(false);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.warn('Translation failed', error);
          setError(true);
        }
      }
    },
    [markUnknown],
  );

  React.useEffect(() => {
    void translateText({ srcLang, srcText, tgtLang });
    // `srcText` is explicitly excluded here to avoid making a translate request
    // on each keypress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markUnknown, srcLang, tgtLang]);

  return (
    <Form aria-label={t('Morphological_Analysis')}>
      <LanguageSelector
        onTranslate={() => translateText({ srcLang, srcText, tgtLang })}
        pairs={pairs}
        recentSrcLangs={recentSrcLangs}
        recentTgtLangs={recentTgtLangs}
        setSrcLang={setSrcLang}
        setTgtLang={setTgtLang}
        srcLang={srcLang}
        tgtLang={tgtLang}
      />
      <TextTranslationForm
        instantTranslation={instantTranslation}
        setSrcText={setSrcText}
        srcLang={srcLang}
        srcText={srcText}
        tgtLang={tgtLang}
        tgtText={tgtText}
        tgtTextError={error}
        translate={translateText}
      />
      <Row className="mt-2 mb-3">
        <Col className="d-flex d-sm-block flex-wrap" md="6" xs="12">
          <Button className="mt-2" style={{ marginRight: '5px' }} type="button" variant="secondary">
            <FontAwesomeIcon icon={faFile} /> {t('Translate_Document')}
          </Button>
          <Button className="mt-2" type="button" variant="secondary">
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
    </Form>
  );
};

export default Translator;
