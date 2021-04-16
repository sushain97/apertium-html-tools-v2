import './translator.css';

import * as React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

import { buildNewUrl, getUrlParam } from '../../util';
import { parentLang, toAlpha3Code } from '../../util/languages';
import { t, tLang } from '../../util/localization';
import useLocalStorage from '../../util/use-local-storage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Pairs: Readonly<Record<string, Set<string>>> = ((window as any).PAIRS as Array<{
  sourceLanguage: string;
  targetLanguage: string;
}>).reduce((pairs, { sourceLanguage, targetLanguage }) => {
  pairs[sourceLanguage] = pairs[sourceLanguage] || new Set();
  pairs[sourceLanguage].add(targetLanguage);
  return pairs;
}, {} as Record<string, Set<string>>);

const recentLangsCount = 3;
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

const TranslationForm = ({
  srcLang,
  setSrcLang,
  dstLang,
  setDstLang,
  recentSrcLangs,
  recentDstLangs,
}: {
  srcLang: string;
  setSrcLang: React.Dispatch<React.SetStateAction<string>>;
  dstLang: string;
  setDstLang: React.Dispatch<React.SetStateAction<string>>;
  recentSrcLangs: Array<string>;
  recentDstLangs: Array<string>;
}): React.ReactElement => {
  return (
    <form>
      <Form.Group className="row d-none d-md-block">
        <Col xs="6" className="d-inline-flex align-items-start justify-content-between">
          <ButtonGroup className="d-flex flex-wrap pl-0">
            {recentSrcLangs.map((lang) => (
              <Button
                key={lang}
                type="button"
                variant="secondary"
                size="sm"
                className="language-button"
                active={lang === srcLang}
                onClick={({ currentTarget }) => {
                  setSrcLang(lang);
                  currentTarget.blur();
                }}
              >
                {tLang(lang)}
              </Button>
            ))}
            <Button type="button" variant="secondary" size="sm">
              {t('Detect_Language')}
            </Button>
            <DropdownButton
              size="sm"
              variant="secondary"
              title=""
              className="language-dropdown-button"
            ></DropdownButton>
          </ButtonGroup>
          <Button type="button" variant="secondary" size="sm">
            <FontAwesomeIcon icon={faExchangeAlt} />
          </Button>
        </Col>
        <Col xs="6" className="d-inline-flex align-items-start justify-content-between">
          <ButtonGroup className="d-flex flex-wrap pl-0">
            {recentDstLangs.map((lang) => (
              <Button
                key={lang}
                type="button"
                variant="secondary"
                size="sm"
                className="language-button"
                active={lang === dstLang}
                onClick={({ currentTarget }) => {
                  setDstLang(lang);
                  currentTarget.blur();
                }}
                disabled={!Pairs[srcLang].has(lang)}
              >
                {tLang(lang)}
              </Button>
            ))}
            <DropdownButton
              size="sm"
              variant="secondary"
              title=""
              className="language-dropdown-button"
            ></DropdownButton>
          </ButtonGroup>
          <Button type="button" size="sm">
            {t('Translate')}
          </Button>
        </Col>
      </Form.Group>
    </form>
  );
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

  const [srcLang, setSrcLang] = useLocalStorage<string>('srcLang', defaultSrcLang, {
    overrideValue: urlSrcLang,
    validateValue: (l) => l in Pairs,
  });
  const [dstLang, setDstLang] = useLocalStorage<string>('dstLang', () => Pairs[srcLang].values().next().value, {
    overrideValue: urlDstLang,
    validateValue: (l) => Pairs[srcLang].has(l),
  });

  const [recentSrcLangs, setRecentSrcLangs] = useLocalStorage<Array<string>>(
    'recentSrcLangs',
    () => {
      const langs = [srcLang];
      for (const lang of Object.keys(Pairs)) {
        if (langs.length == recentLangsCount) {
          break;
        }
        langs.push(lang);
      }
      return langs;
    },
    {
      validateValue: (ls) => ls.length == recentLangsCount && ls.every((l) => l in Pairs) && ls.includes(srcLang),
    },
  );
  const [recentDstLangs, setRecentDstLangs] = useLocalStorage<Array<string>>(
    'recentDstLangs',
    () => {
      const langs = [];
      for (const lang of Pairs[srcLang].values()) {
        if (langs.length == recentLangsCount) {
          break;
        }
        langs.push(lang);
      }
      for (const [_, dstLangs] of Object.entries(Pairs)) {
        for (const lang of dstLangs) {
          if (langs.length == recentLangsCount) {
            break;
          }
          if (!langs.includes(lang)) {
            langs.push(lang);
          }
        }
      }
      return langs;
    },
    {
      validateValue: (ls) =>
        ls.length == recentLangsCount && ls.some((l) => Pairs[srcLang].has(l)) && ls.includes(dstLang),
    },
  );

  React.useEffect(() => {
    const newUrl = buildNewUrl({ [pairUrlParam]: `${srcLang}-${dstLang}` });
    window.history.replaceState({}, document.title, newUrl);
  }, [srcLang, dstLang]);

  return (
    <>
      <TranslationForm
        srcLang={srcLang}
        setSrcLang={setSrcLang}
        recentSrcLangs={recentSrcLangs}
        dstLang={dstLang}
        setDstLang={setDstLang}
        recentDstLangs={recentDstLangs}
      />
    </>
  );
};

export default Translator;
