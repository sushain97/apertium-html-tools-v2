import * as React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Row from 'react-bootstrap/Row';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { useLocalization } from '../../util/localization';

// TODO: translation
// TODO: drop document

const DocTranslationForm = ({
  cancelLink,
}: {
  cancelLink: string;
  srcLang: string;
  tgtLang: string;
  setLoading: (loading: boolean) => void;
}): React.ReactElement => {
  const { t } = useLocalization();

  return (
    <Row>
      <Col md="6">
        <Card bg="light">
          <Card.Body>
            <input
              accept="text/plain,text/html,text/rtf,application/rtf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.oasis.opendocument.text,application/x-latex,application/x-tex"
              type="file"
            />
            <div className="mt-3">
              <span className="text-danger lead" style={{ display: 'none' }} />
              <div className="progress mb-0 d-none">
                <div
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={0}
                  className="progress-bar progress-bar-striped progress-bar-animated w-0"
                  role="progressbar"
                />
              </div>
            </div>
            <p dangerouslySetInnerHTML={{ __html: t('Supported_Formats') }} />
            <Button
              className="position-absolute"
              href={cancelLink}
              size="sm"
              style={{ bottom: '-6px', right: '20px' }}
              variant="secondary"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> {t('Cancel')}
            </Button>
          </Card.Body>
        </Card>
      </Col>
      <Col md="6" />
    </Row>
  );
};

export default DocTranslationForm;
