import * as React from 'react';
import axios, { CancelTokenSource } from 'axios';
import classNames from 'classnames';
import Alert from 'react-bootstrap/Alert';
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

const formatUnit = (unit: string) => {
  const tagRegex = /<([^>]+)>/g,
    tags = [];
  let tagMatch = tagRegex.exec(unit);
  while (tagMatch) {
    tags.push(tagMatch[1]);
    tagMatch = tagRegex.exec(unit);
  }

  const tagStartLoc = unit.indexOf('<');
  return (
    unit.substring(0, tagStartLoc !== -1 ? tagStartLoc : unit.length) +
    (tags.length > 0 ? `  ↤  ${tags.join(' ⋅ ')}` : '')
  );
};

const AnalysisResult = ({
  analysis,
  className,
}: {
  analysis: Array<[string, string]>;
  className?: string;
}): React.ReactElement => {
  const unitRegex = /([^<]*)((<[^>]+>)*)/g;

  return (
    <Table hover className={className}>
      <tbody>
        {analysis.map(([unit, stem], i) => {
          const splitUnit = unit.split('/');

          const morphemes: Array<React.ReactElement> = [];
          const joinedMorphemes: Record<string, Array<string>> = {};
          splitUnit.slice(1).forEach((unit, i) => {
            const matches = unit.match(unitRegex);

            if (matches && matches.length > 2) {
              matches.slice(1, matches.length - 1).forEach((match) => {
                if (joinedMorphemes[match]) {
                  joinedMorphemes[match].push(unit);
                } else {
                  joinedMorphemes[match] = [unit];
                }
              });
            } else {
              morphemes.push(<div key={`split-${i}`}>{formatUnit(unit)}</div>);
            }
          });
          Object.entries(joinedMorphemes).forEach(([joinedMorpheme, units], i) => {
            morphemes.push(<div key={`joined-${i}`}>{formatUnit(joinedMorpheme)}</div>);
            units.forEach((unit, j) => {
              const unitMatch = unit.match(unitRegex);
              if (unitMatch) {
                morphemes.push(
                  <div key={`joined-unitt-${j}`} style={{ marginLeft: '30px' }}>
                    {formatUnit(unitMatch[0])}
                  </div>,
                );
              }
            });
          });

          return (
            <tr key={i}>
              <td className="text-right">
                <strong>{stem.trim()}</strong>
                <span>{'  ↬'}</span>
              </td>
              <td
                className={classNames('text-left', {
                  'text-danger': splitUnit[1][0] === '*',
                })}
              >
                {morphemes}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

const AnalysisForm = ({
  setLoading,
  setAnalysis,
  setError,
}: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setAnalysis: React.Dispatch<React.SetStateAction<Array<[string, string]>>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
}): React.ReactElement => {
  const [lang, setLang] = useLocalStorage('analyzerLang', Object.keys(Analyzers)[0]);
  const [text, setText] = useLocalStorage('analyzerText', '');

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
        setError(null);
        setLoading(false);

        analysisRef.current = null;
      } catch (error) {
        if (!axios.isCancel(error)) {
          setAnalysis([]);
          setError(error);
          setLoading(false);
        }
      }
    })();
  };

  return (
    <Form>
      <Form.Group controlId="analysis-lang" className="row">
        <Form.Label className="col-md-2 col-lg-1 col-form-label text-md-right">{t('Language')}</Form.Label>
        <Col md="3">
          <Form.Control as="select" value={lang} onChange={({ target: { value } }) => setLang(value)} required>
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
        <Form.Label className="col-md-2 col-lg-1 col-form-label text-md-right">{t('Input_Text')}</Form.Label>
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
  );
};

const Analyzer = (): React.ReactElement => {
  const [loading, setLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<Array<[string, string]>>([]);
  const [error, setError] = React.useState<Error | null>(null);

  return (
    <>
      <AnalysisForm setLoading={setLoading} setAnalysis={setAnalysis} setError={setError} />
      <hr />
      <div
        className={classNames({
          blurred: loading,
        })}
      >
        {analysis.length ? <AnalysisResult analysis={analysis} /> : null}
        {error && <Alert variant="danger">{error.toString()}</Alert>}
      </div>
    </>
  );
};

export default Analyzer;
