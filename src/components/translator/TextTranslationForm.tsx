import * as React from 'react';
import classNames from 'classnames';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCopy } from '@fortawesome/free-solid-svg-icons';

import { langDirection } from '../../util/languages';
import { t } from '../../util/localization';

const TextTranslationForm = ({
  srcLang,
  dstLang,
  srcText,
  dstText,
  dstTextError,
  setSrcText,
}: {
  srcLang: string;
  dstLang: string;
  srcText: string;
  dstText: string;
  dstTextError: boolean;
  setSrcText: React.Dispatch<React.SetStateAction<string>>;
}): React.ReactElement => {
  const srcTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const notAvailableText = t('Not_Available');

  return (
    <Row>
      <Col xs="12" md="6">
        <Form.Control
          as="textarea"
          spellCheck={false}
          rows={15}
          dir={langDirection(srcLang)}
          value={srcText}
          onChange={({ target: { value } }) => setSrcText(value)}
          ref={srcTextareaRef}
        />
        <Button
          className="position-absolute clear-text-button"
          variant="muted"
          onClick={() => {
            setSrcText('');
            srcTextareaRef.current?.focus();
          }}
        >
          <FontAwesomeIcon icon={faTimes} fixedWidth />
        </Button>
      </Col>
      <Col xs="12" md="6">
        <Form.Control
          as="textarea"
          className={classNames('bg-light', { 'text-danger': dstTextError })}
          spellCheck={false}
          rows={15}
          dir={langDirection(dstLang)}
          value={dstTextError ? notAvailableText : dstText}
          readOnly
        />
        <Button className="position-absolute copy-text-button" variant="muted">
          <FontAwesomeIcon icon={faCopy} fixedWidth />
        </Button>
      </Col>
    </Row>
  );
};

export default TextTranslationForm;
