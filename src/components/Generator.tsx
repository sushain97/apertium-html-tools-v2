import * as React from 'react';
import classNames from 'classnames';
import axios, { CancelTokenSource } from 'axios';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import Config from '../../config';
import { t, tLang } from '../util/localization';
import { get } from '../util/jsonp';
import useLocalStorage from '../util/use-local-storage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Generators: Readonly<Record<string, string>> = (window as any).GENERATORS;

const GeneratorForm = ({
  setLoading,
  setGeneration,
  setError,
}: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setGeneration: React.Dispatch<React.SetStateAction<Array<[string, string]>>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
}): React.ReactElement => {
  const [lang, setLang] = useLocalStorage('generatorLang', Object.keys(Generators)[0]);
  const [text, setText] = useLocalStorage('generatorText', '');

  const generationRef = React.useRef<CancelTokenSource | null>(null);

  const handleSubmit = () => {
    if (text.trim().length == 0) {
      return;
    }

    generationRef.current?.cancel();
    generationRef.current = null;

    (async () => {
      try {
        setLoading(true);
        const [ref, request] = get(`${Config.apyURL}/generate`, { lang, q: text });
        generationRef.current = ref;

        setGeneration((await request).data as Array<[string, string]>);
        setError(null);
        setLoading(false);

        generationRef.current = null;
      } catch (error) {
        if (!axios.isCancel(error)) {
          setGeneration([]);
          setError(error);
          setLoading(false);
        }
      }
    })();
  };

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
          <Button type="submit" variant="primary" onClick={handleSubmit}>
            {t('Generate')}
          </Button>
        </Col>
      </Form.Group>
    </Form>
  );
};

const Generator = (): React.ReactElement => {
  const [loading, setLoading] = React.useState(false);
  const [generation, setGeneration] = React.useState<Array<[string, string]>>([]);
  const [error, setError] = React.useState<Error | null>(null);

  return (
    <>
      <GeneratorForm setLoading={setLoading} setGeneration={setGeneration} setError={setError} />
      <hr />
      <div
        className={classNames({
          blurred: loading,
        })}
      >
        {generation.map(([analysis, stem], i) => (
          <div key={i} data-toggle="tooltip" data-placement="auto" data-html="true">
            <strong>{stem.trim()}</strong>
            <span>
              {'  ↬  '}
              {analysis}
            </span>
          </div>
        ))}
        {error && <Alert variant="danger">{error.toString()}</Alert>}
      </div>
    </>
  );
};

export default Generator;
