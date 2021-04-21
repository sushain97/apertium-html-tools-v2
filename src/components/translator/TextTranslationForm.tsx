import * as React from 'react';
import axios, { CancelTokenSource } from 'axios';
import { faCopy, faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import classNames from 'classnames';

import { MaxURLLength, buildNewUrl, getUrlParam } from '../../util/url';
import { apyFetch } from '../../util';
import { baseUrlParams } from '.';
import { langDirection } from '../../util/languages';
import useLocalStorage from '../../util/useLocalStorage';
import { useLocalization } from '../../util/localization';

// TODO: textarea height sync
// TODO: url detection

const textUrlParam = 'q';

const instantTranslationPunctuationDelay = 1000,
  instantTranslationDelay = 3000;

const punctuation = new Set(['Period', 'Semicolon', 'Comma', 'Digit1', 'Slash']);

const isKeyUpEvent = (event: React.SyntheticEvent): event is React.KeyboardEvent => event.type === 'keyup';

const TextTranslationForm = ({
  srcLang,
  tgtLang,
  markUnknown,
  instantTranslation,
}: {
  srcLang: string;
  tgtLang: string;
  instantTranslation: boolean;
  markUnknown: boolean;
}): React.ReactElement => {
  const { t } = useLocalization();

  const srcTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [srcText, setSrcText] = useLocalStorage('srcText', '', { overrideValue: getUrlParam(textUrlParam) });

  React.useEffect(() => {
    const baseParams = baseUrlParams({ srcLang, tgtLang });
    let newUrl = buildNewUrl({ ...baseParams, [textUrlParam]: srcText });
    if (newUrl.length > MaxURLLength) {
      newUrl = buildNewUrl(baseParams);
    }
    window.history.replaceState({}, document.title, newUrl);
  }, [srcLang, tgtLang, srcText]);

  const [tgtText, setTgtText] = React.useState('');

  const [error, setError] = React.useState(false);
  const translationRef = React.useRef<CancelTokenSource | null>(null);

  const translate = React.useCallback(() => {
    void (async () => {
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
    })();
  }, [markUnknown, srcLang, srcText, tgtLang]);

  const translationTimer = React.useRef<number | null>(null);
  const lastPunct = React.useRef(false);

  const handleSrcTextChange = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement> | React.ClipboardEvent<HTMLTextAreaElement>) => {
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
    [translate, instantTranslation],
  );

  React.useEffect(() => {
    window.addEventListener('translate', translate, false);
    return () => window.removeEventListener('translate', translate);
  }, [translate]);

  // `translate` is explicitly excluded here to avoid making a translate request
  // on each keypress.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(translate, [markUnknown, srcLang, tgtLang]);

  return (
    <Row>
      <Col md="6" xs="12">
        <Form.Control
          aria-label={t('Input_Text')}
          as="textarea"
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

export default TextTranslationForm;
