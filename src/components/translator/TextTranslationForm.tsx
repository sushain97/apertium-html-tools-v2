import * as React from 'react';
import axios, { CancelTokenSource } from 'axios';
import { faCopy, faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import { MaxURLLength, buildNewSearch, getUrlParam } from '../../util/url';
import { TranslateEvent, baseUrlParams } from '.';
import { apyFetch } from '../../util';
import { buildUrl as buildWebpageTranslationUrl } from './WebpageTranslationForm';
import { langDirection } from '../../util/languages';
import useLocalStorage from '../../util/useLocalStorage';
import { useLocalization } from '../../util/localization';

const textUrlParam = 'q';

const instantTranslationPunctuationDelay = 1000,
  instantTranslationDelay = 3000;

const punctuation = new Set(['Period', 'Semicolon', 'Comma', 'Digit1', 'Slash']);

const autoResizeMinimumWidth = 768;

const isKeyUpEvent = (event: React.SyntheticEvent): event is React.KeyboardEvent => event.type === 'keyup';

const TextTranslationForm = ({
  srcLang,
  tgtLang,
  markUnknown,
  instantTranslation,
  setLoading,
}: {
  srcLang: string;
  tgtLang: string;
  instantTranslation: boolean;
  markUnknown: boolean;
  setLoading: (loading: boolean) => void;
}): React.ReactElement => {
  const { t } = useLocalization();
  const history = useHistory();

  const srcTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const tgtTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [srcText, setSrcText] = useLocalStorage('srcText', '', {
    overrideValue: getUrlParam(history.location.search, textUrlParam),
  });

  React.useEffect(() => {
    const baseParams = baseUrlParams({ srcLang, tgtLang });
    let search = buildNewSearch({ ...baseParams, [textUrlParam]: srcText });
    if (search.length > MaxURLLength) {
      search = buildNewSearch(baseParams);
    }
    history.replace({ search });
  }, [srcLang, tgtLang, srcText, history]);

  const [tgtText, setTgtText] = React.useState('');

  const [error, setError] = React.useState(false);
  const translationRef = React.useRef<CancelTokenSource | null>(null);

  const translate = React.useCallback(() => {
    if (srcText.trim().length === 0) {
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
    setLoading(true);

    void (async () => {
      try {
        const response = (await request).data as {
          responseData: { translatedText: string };
          responseDetails: unknown;
          responseStatus: number;
        };
        setTgtText(response.responseData.translatedText);
        setError(false);
        setLoading(false);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.warn('Translation failed', error);
          setError(true);
          setLoading(false);
        }
      }
    })();

    return () => translationRef.current?.cancel();
  }, [markUnknown, setLoading, srcLang, srcText, tgtLang]);

  const translationTimer = React.useRef<number | null>(null);
  const lastPunct = React.useRef(false);

  const handleSrcTextChange = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement> | React.ClipboardEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      if (/^https?:\/\/.+$/.test(value)) {
        history.push(buildWebpageTranslationUrl(value));
      }

      if (lastPunct.current && isKeyUpEvent(event) && (event.code === 'Space' || event.code === 'Enter')) {
        // Don't override the short timeout for simple space-after-punctuation.
        return;
      }

      if (translationTimer.current && instantTranslation) {
        clearTimeout(translationTimer.current);
      }

      let timeout;
      if (isKeyUpEvent(event) && punctuation.has(event.code)) {
        timeout = instantTranslationPunctuationDelay;
        lastPunct.current = true;
      } else {
        timeout = instantTranslationDelay;
        lastPunct.current = false;
      }

      translationTimer.current = window.setTimeout(() => {
        if (instantTranslation) {
          translate();
        }
      }, timeout);
    },
    [instantTranslation, history, translate],
  );

  React.useEffect(() => {
    window.addEventListener(TranslateEvent, translate, false);
    return () => window.removeEventListener(TranslateEvent, translate);
  }, [translate]);

  // `translate` is explicitly excluded here to avoid making a translate request
  // on each keypress.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(translate, [markUnknown, srcLang, tgtLang]);

  React.useLayoutEffect(() => {
    if (window.innerWidth < autoResizeMinimumWidth) {
      return;
    }

    const { current: srcTextarea } = srcTextareaRef;
    const { current: tgtTextarea } = tgtTextareaRef;
    if (!srcTextarea || !tgtTextarea) {
      return;
    }

    srcTextarea.style.overflowY = 'hidden';
    srcTextarea.style.height = 'auto';

    const { scrollHeight } = srcTextarea;
    srcTextarea.style.height = `${scrollHeight}px`;
    tgtTextarea.style.height = `${scrollHeight}px`;
  }, [srcText]);

  return (
    <Row>
      <Col md="6" xs="12">
        <Form.Control
          aria-label={t('Input_Text')}
          as="textarea"
          autoFocus
          className="mb-2"
          dir={langDirection(srcLang)}
          onChange={({ target: { value } }) => setSrcText(value)}
          onKeyUp={handleSrcTextChange}
          onPaste={handleSrcTextChange}
          ref={srcTextareaRef}
          rows={15}
          spellCheck={false}
          value={srcText}
        />
        <Button
          className="position-absolute clear-text-button"
          onClick={() => {
            setSrcText('');
            srcTextareaRef.current?.focus();
          }}
          variant="muted"
        >
          <FontAwesomeIcon fixedWidth icon={faTimes} />
        </Button>
      </Col>
      <Col md="6" xs="12">
        <Form.Control
          as="textarea"
          className={classNames('bg-light mb-2', { 'text-danger': error })}
          dir={langDirection(tgtLang)}
          readOnly
          ref={tgtTextareaRef}
          rows={15}
          spellCheck={false}
          value={error ? t('Not_Available') : tgtText}
        />
        <Button className="position-absolute copy-text-button" variant="muted">
          <FontAwesomeIcon fixedWidth icon={faCopy} />
        </Button>
      </Col>
    </Row>
  );
};

export const Path = '/translation';

export default TextTranslationForm;
