import './translator.css';

import * as React from 'react';
import axios, { CancelTokenSource } from 'axios';
import { faFile, faLink } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Row from 'react-bootstrap/Row';

import { DstLangs, Pairs, SrcLangs, isPair } from '.';
import { MaxURLLength, buildNewUrl, getUrlParam } from '../../util/url';
import { parentLang, toAlpha3Code } from '../../util/languages';
import LanguageSelector from './LanguageSelector';
import TextTranslationForm from './TextTranslationForm';
import { apyFetch } from '../../util';
import useLocalStorage from '../../util/use-local-storage';
import { useLocalization } from '../../util/localization';

const recentLangsCount = 3;
const pairUrlParam = 'dir';
const textUrlParam = 'q';

const defaultSrcLang = (): string => {
  const validSrcLang = (code: string) => Pairs[toAlpha3Code(code) || code];

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { navigator } = window as any;
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
  for (const srcLang in Pairs) {
    return srcLang;
  }

  throw new Error('No pairs available');
};

const Translator = (): React.ReactElement => {
  const { t } = useLocalization();

  let urlSrcLang = null;
  let urlDstLang = null;
  const urlParamPair = getUrlParam(pairUrlParam);
  if (urlParamPair) {
    const [src, dst] = urlParamPair.split('-', 2).map(toAlpha3Code);
    if (src && dst && isPair(src, dst)) {
      urlSrcLang = src;
      urlDstLang = dst;
    }
  }

  const [srcLang, realSetSrcLang] = useLocalStorage<string>('srcLang', defaultSrcLang, {
    overrideValue: urlSrcLang,
    validateValue: (l) => l in Pairs,
  });
  const [dstLang, realSetDstLang] = useLocalStorage<string>('dstLang', () => Pairs[srcLang].values().next().value, {
    overrideValue: urlDstLang,
    validateValue: (l) => Pairs[srcLang].has(l),
  });

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
      validateValue: (ls) => ls.length == recentLangsCount && ls.every((l) => l in Pairs) && ls.includes(srcLang),
    },
  );
  const [recentDstLangs, setRecentDstLangs] = useLocalStorage<Array<string>>(
    'recentDstLangs',
    () => {
      const langs = new Set([dstLang]);
      for (const lang of Pairs[srcLang].values()) {
        if (langs.size == recentLangsCount) {
          break;
        }
        langs.add(lang);
      }
      for (const lang of DstLangs) {
        if (langs.size == recentLangsCount) {
          break;
        }
        langs.add(lang);
      }
      return Array.from(langs);
    },
    {
      validateValue: (ls) =>
        ls.length == recentLangsCount && ls.some((l) => isPair(srcLang, l)) && ls.includes(dstLang),
    },
  );

  const setSrcLang = (lang: string) => {
    realSetSrcLang(lang);
    if (!recentSrcLangs.includes(lang)) {
      setRecentSrcLangs([lang, ...recentSrcLangs].slice(0, recentLangsCount));
    }

    // Unless currently selected destination language works.
    if (!isPair(lang, dstLang)) {
      // Prefer a recently selected destination language.
      for (const recentDstLang of recentDstLangs) {
        if (isPair(lang, recentDstLang)) {
          return setDstLang(recentDstLang);
        }
      }

      // Otherwise, pick the first possible destination language.
      setDstLang((Pairs[lang] || new Set()).values().next().value);
    }
  };

  const setDstLang = (lang: string) => {
    realSetDstLang(lang);
    if (!recentDstLangs.includes(lang)) {
      setRecentDstLangs([lang, ...recentDstLangs].slice(0, recentLangsCount));
    }
  };

  const [srcText, setSrcText] = useLocalStorage('srcText', '', { overrideValue: getUrlParam(textUrlParam) });
  const [dstText, setDstText] = React.useState('');

  React.useEffect(() => {
    const pair = `${srcLang}-${dstLang}`;
    let newUrl = buildNewUrl({ [pairUrlParam]: pair, [textUrlParam]: srcText });
    if (newUrl.length > MaxURLLength) {
      newUrl = buildNewUrl({ [pairUrlParam]: pair });
    }
    window.history.replaceState({}, document.title, newUrl);
  }, [srcLang, dstLang, srcText]);

  const [error, setError] = React.useState(false);
  const translationRef = React.useRef<CancelTokenSource | null>(null);

  const onTranslate = async () => {
    if (srcText.trim().length == 0) {
      return;
    }

    translationRef.current?.cancel();
    translationRef.current = null;

    const [ref, request] = apyFetch('translate', {
      q: srcText,
      langpair: `${srcLang}|${dstLang}`,
    });
    translationRef.current = ref;

    try {
      const response = (await request).data as {
        responseData: { translatedText: string };
        responseDetails: unknown;
        responseStatus: number;
      };
      setDstText(response.responseData.translatedText);
      setError(false);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.warn('Translation failed', error);
        setError(true);
      }
    }
  };

  return (
    <>
      <LanguageSelector
        srcLang={srcLang}
        setSrcLang={setSrcLang}
        recentSrcLangs={recentSrcLangs}
        dstLang={dstLang}
        setDstLang={setDstLang}
        recentDstLangs={recentDstLangs}
        onTranslate={onTranslate}
      />
      <TextTranslationForm
        srcLang={srcLang}
        dstLang={dstLang}
        srcText={srcText}
        dstText={dstText}
        dstTextError={error}
        setSrcText={setSrcText}
      />
      <Row className="mt-2 mb-3">
        <Col xs="12" md="6" className="d-flex d-sm-block flex-wrap">
          <Button type="button" variant="secondary" className="mt-2" style={{ marginRight: '5px' }}>
            <FontAwesomeIcon icon={faFile} /> {t('Translate_Document')}
          </Button>
          <Button type="button" variant="secondary" className="mt-2">
            <FontAwesomeIcon icon={faLink} /> {t('Translate_Webpage')}
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Translator;