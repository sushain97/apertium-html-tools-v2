import * as React from 'react';
import axios, { CancelTokenSource } from 'axios';
import classNames from 'classnames';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import Config from '../../config';
import { t, tLang } from '../util/localization';
import { get } from '../util/jsonp';
import useLocalStorage from '../util/use-local-storage';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Analyzers: Readonly<Record<string, string>> = (window as any).ANALYZERS;

const AnalysisResult = ({
  analysis,
  className,
}: {
  analysis: Array<[string, string]>;
  className?: string;
}): React.ReactElement => {
  return (
    <Table hover className={className}>
      <tbody>
        {analysis.map(([unit, stem], i) => {
          const splitUnit = unit.split('/');

          return (
            <tr key={i}>
              <td className="text-right">
                <strong>{stem.trim()}</strong>
                <span>&nbsp;&nbsp;{'↬'}</span>
              </td>
              <td
                className={classNames('text-left', {
                  'text-danger': splitUnit[1][0] === '*',
                })}
              ></td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

const Analyzer = (): React.ReactElement => {
  const [lang, setLang] = useLocalStorage('analyzerLang', Object.keys(Analyzers)[0]);
  const [text, setText] = useLocalStorage('analyzerText', '');

  const [loading, setLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<Array<[string, string]>>([]);
  const analysisRef = React.useRef<CancelTokenSource | null>(null);

  const handleSubmit = () => {
    if (text.trim().length == 0) {
      return;
    }

    analysisRef.current?.cancel();
    analysisRef.current = null;

    (async () => {
      try {
        setLoading(true);
        const [ref, request] = get(`${Config.apyURL}/analyze`, { lang, q: text });
        analysisRef.current = ref;
        setAnalysis((await request).data as Array<[string, string]>);
        setLoading(false);
        analysisRef.current = null;
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Analysis request failed', error);
          setLoading(false);
        }
      }
    })();
  };

  return (
    <>
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
              {Object.keys(Analyzers)
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
        <Form.Group controlId="analysis-input" className="row">
          <Form.Label className="col-md-2 col-lg-1 col-form-label text-md-right">
            {t('Input_Text')}
          </Form.Label>
          <Col md="10">
            <Form.Control
              as="textarea"
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
            <Button type="submit" variant="primary" onClick={handleSubmit}>
              {t('Analyze')}
            </Button>
          </Col>
        </Form.Group>
      </Form>
      {analysis.length ? (
        <AnalysisResult
          analysis={analysis}
          className={classNames({
            blurred: loading,
          })}
        />
      ) : null}
    </>
  );
};

export default Analyzer;
