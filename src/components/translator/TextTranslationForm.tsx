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
  const { t } = useLocalization();

  const srcTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const notAvailableText = t('Not_Available');

  return (
    <Row>
      <Col md="6" xs="12">
        <Form.Control
          as="textarea"
          className="mb-2"
          dir={langDirection(srcLang)}
          onChange={({ target: { value } }) => setSrcText(value)}
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
          className={classNames('bg-light mb-2', { 'text-danger': dstTextError })}
          dir={langDirection(dstLang)}
          readOnly
          rows={15}
          spellCheck={false}
          value={dstTextError ? notAvailableText : dstText}
        />
        <Button className="position-absolute copy-text-button" variant="muted">
          <FontAwesomeIcon fixedWidth icon={faCopy} />
        </Button>
      </Col>
    </Row>
  );
};

export default TextTranslationForm;
