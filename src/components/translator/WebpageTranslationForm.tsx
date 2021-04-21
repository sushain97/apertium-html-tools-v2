import * as React from 'react';
import { faArrowLeft, faLink } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';

import { useLocalization } from '../../util/localization';

// TODO: translation

const WebpageTranslationForm = ({
  cancelLink,
}: {
  cancelLink: string;
  srcLang: string;
  tgtLang: string;
}): React.ReactElement => {
  const { t } = useLocalization();

  return (
    <Row>
      <Col sm="12">
        <div className="d-inline-flex mb=2 w-100">
          <Button href={cancelLink} variant="secondary">
            <FontAwesomeIcon icon={faArrowLeft} /> {t('Cancel')}
          </Button>
          <InputGroup className="ml-3">
            <InputGroup.Prepend>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faLink} />
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control autoComplete="url" placeholder="URL ⏎" required />
          </InputGroup>
        </div>
      </Col>
    </Row>
  );
};

export default WebpageTranslationForm;
