import * as React from 'react';
import Button from 'react-bootstrap/esm/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCopy } from '@fortawesome/free-solid-svg-icons';

import { langDirection } from '../../util/languages';

const TextTranslationForm = ({
  srcLang,
  dstLang,
  srcText,
  setSrcText,
}: {
  srcLang: string;
  dstLang: string;
  srcText: string;
  setSrcText: React.Dispatch<React.SetStateAction<string>>;
}): React.ReactElement => {
  return (
    <Form.Group>
      <Row>
        <Col xs="12" md="6">
          <Form.Control
            as="textarea"
            spellCheck={false}
            rows={15}
            dir={langDirection(srcLang)}
            value={srcText}
            onChange={({ target: { value } }) => setSrcText(value)}
          />
          <Button className="position-absolute clear-text-button" onClick={() => setSrcText('')}>
            <FontAwesomeIcon icon={faTimes} fixedWidth />
          </Button>
        </Col>
        <Col xs="12" md="6">
          <Form.Control
            as="textarea"
            className="bg-light"
            spellCheck={false}
            rows={15}
            dir={langDirection(dstLang)}
            readOnly
          />
          <Button className="position-absolute copy-text-button">
            <FontAwesomeIcon icon={faCopy} fixedWidth />
          </Button>
        </Col>
      </Row>
    </Form.Group>
  );
};

export default TextTranslationForm;
