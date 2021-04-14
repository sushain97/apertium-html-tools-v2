import * as React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import { t, tLang } from '../util/localization';
import useLocalStorage from '../util/use-local-storage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Generators: Readonly<Record<string, string>> = (window as any).GENERATORS;

const Generator = (): React.ReactElement => {
  const [lang, setLang] = useLocalStorage('generatorLang', Object.keys(Generators)[0]);
  const [text, setText] = useLocalStorage('generatorText', '');

  return (
    <Form>
      <Form.Group controlId="generator-lang" className="row">
        <Form.Label className="col-md-2 col-lg-1 col-form-label text-md-right">{t('Language')}</Form.Label>
        <Col md="3">
          <Form.Control as="select" value={lang} onChange={({ target: { value } }) => setLang(value)} required>
            {Object.keys(Generators)
              .map((code) => [code, tLang(code)])
              .sort(([, a], [, b]) => {
                return a.toLowerCase().localeCompare(b.toLowerCase());
              })
              .map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
          </Form.Control>
        </Col>
      </Form.Group>
      <Form.Group controlId="generator-input" className="row">
        <Form.Label className="col-md-2 col-lg-1 col-form-label text-md-right">{t('Input_Text')}</Form.Label>
        <Col md="10">
          <Form.Control
            as="textarea"
            rows={5}
            spellCheck={false}
            value={text}
            onChange={({ target: { value } }) => setText(value)}
            placeholder={t('Morphological_Generation_Help')}
            required
          ></Form.Control>
        </Col>
      </Form.Group>
      <Form.Group className="row">
        <Col md="10" className="offset-md-2 col-md-10 offset-lg-1">
          <Button type="submit" variant="primary">
            {t('Generate')}
          </Button>
        </Col>
      </Form.Group>
    </Form>
  );
};

export default Generator;
