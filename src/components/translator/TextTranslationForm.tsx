import * as React from 'react';
import { faCopy, faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import classNames from 'classnames';

import { langDirection } from '../../util/languages';
import { useLocalization } from '../../util/localization';

const instantTranslationPunctuationDelay = 1000,
  instantTranslationDelay = 3000;

const punctuation = new Set(['Period', 'Semicolon', 'Comma', 'Digit1', 'Slash']);

const isKeyUpEvent = (event: React.SyntheticEvent): event is React.KeyboardEvent => event.type === 'keyup';

const TextTranslationForm = ({
  srcLang,
  tgtLang,
  srcText,
  tgtText,
  tgtTextError,
  setSrcText,
  instantTranslation,
  translate,
}: {
  srcLang: string;
  tgtLang: string;
  srcText: string;
  tgtText: string;
  tgtTextError: boolean;
  instantTranslation: boolean;
  setSrcText: React.Dispatch<React.SetStateAction<string>>;
  translate: ({ srcText, srcLang, tgtLang }: { srcText: string; srcLang: string; tgtLang: string }) => void;
}): React.ReactElement => {
  const { t } = useLocalization();

  const srcTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const notAvailableText = t('Not_Available');

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

      const { currentTarget } = event; // https://github.com/facebook/react/issues/8690
      translationTimer.current = window.setTimeout(() => {
        if (instantTranslation) {
          translate({ srcLang, tgtLang, srcText: currentTarget.value });
        }
      }, timeout);
    },
    [srcLang, tgtLang, instantTranslation, translate],
  );

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
          className={classNames('bg-light mb-2', { 'text-danger': tgtTextError })}
          dir={langDirection(tgtLang)}
          readOnly
          rows={15}
          spellCheck={false}
          value={tgtTextError ? notAvailableText : tgtText}
        />
        <Button className="position-absolute copy-text-button" variant="muted">
          <FontAwesomeIcon fixedWidth icon={faCopy} />
        </Button>
      </Col>
    </Row>
  );
};

export default TextTranslationForm;
