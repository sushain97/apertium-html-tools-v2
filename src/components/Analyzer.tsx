import * as React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import { t } from '../util/localization';
import useLocalStorage from '../util/use-local-storage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Analyzers: { [code: string]: string } = (window as any).ANALYZERS;

const Analyzer = (): React.ReactElement => {
  const [lang, setLang] = useLocalStorage('analyzerLang', Object.keys(Analyzers)[0]);
  const [text, setText] = useLocalStorage('analyzerText', '');

  return (
    <Form>
      <Form.Group controlId="analysis-lang" className="row">
        <Form.Label className="col-md-2 col-lg-1 col-form-label text-md-right">
          {t('Language')}
        </Form.Label>
        <Col md="3">
          <Form.Control
            as="select"
            value={lang}
            onChange={({ target: { value } }) => setLang(value)}
            required
          >
            {Object.keys(Analyzers).map((code) => (
              <option key={code}>{code}</option>
            ))}
          </Form.Control>
        </Col>
      </Form.Group>
      <Form.Group controlId="analysis-input" className="row">
        <Form.Label className="col-md-2 col-lg-1 col-form-label text-md-right">
          {t('Input_Text')}
        </Form.Label>
        <Col md="10">
          <Form.Control
            as="textarea"
            className="form-control"
            rows={5}
            spellCheck={false}
            value={text}
            onChange={({ target: { value } }) => setText(value)}
            placeholder={t('Morphological_Analysis_Help')}
            required
          ></Form.Control>
        </Col>
      </Form.Group>
      <Form.Group className="row">
        <Col md="10" className="offset-md-2 col-md-10 offset-lg-1">
          <Button type="submit" variant="primary">
            {t('Analyze')}
          </Button>
        </Col>
      </Form.Group>
    </Form>
  );
};

export default Analyzer;
