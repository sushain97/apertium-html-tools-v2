import * as React from 'react';

import { buildNewUrl, getUrlParam } from '../util';
import { parentLang, toAlpha3Code } from '../util/languages';
import useLocalStorage from '../util/use-local-storage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Pairs: Readonly<Record<string, Set<string>>> = ((window as any).PAIRS as Array<{
  sourceLanguage: string;
  targetLanguage: string;
}>).reduce((pairs, { sourceLanguage, targetLanguage }) => {
  pairs[sourceLanguage] = pairs[sourceLanguage] || new Set();
  pairs[sourceLanguage].add(targetLanguage);
  return pairs;
}, {} as Record<string, Set<string>>);

const pairUrlParam = 'dir';

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
  let urlSrcLang = null;
  let urlDstLang = null;
  const urlParamPair = getUrlParam(pairUrlParam);
  if (urlParamPair) {
    const [src, dst] = urlParamPair.split('-', 2).map(toAlpha3Code);
    if (src && dst && Pairs[src]?.has(dst)) {
      urlSrcLang = src;
      urlDstLang = dst;
    }
  }

  const initialSrcLang = defaultSrcLang();
  // TODO: Port the complex logic.
  const initialDstLang = Pairs[initialSrcLang].values().next().value;

  const [srcLang, setSrcLang] = useLocalStorage<string>('srcLang', initialSrcLang, {
    overrideValue: urlSrcLang,
    validateValue: (l) => l in Pairs,
  });
  const [dstLang, setDstLang] = useLocalStorage<string>('dstLang', initialDstLang, {
    overrideValue: urlDstLang,
    validateValue: (l) => Pairs[srcLang].has(l),
  });

  React.useEffect(() => {
    const newUrl = buildNewUrl({ [pairUrlParam]: `${srcLang}-${dstLang}` });
    window.history.replaceState({}, document.title, newUrl);
  }, [srcLang, dstLang]);

  return <>{`${srcLang}-${dstLang}`}</>;
};

export default Translator;
