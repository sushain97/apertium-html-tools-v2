import * as React from 'react';
import axios, { CancelTokenSource } from 'axios';
import { faArrowLeft, faFileDownload } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import { useHistory } from 'react-router-dom';

import { TranslateEvent, baseUrlParams } from '.';
import Config from '../../../config';
import { buildNewSearch } from '../../util/url';
import { useLocalization } from '../../util/localization';

// TODO: drag and drop support

const fileSizeLimit = 32e6;

const allowedMimeTypes = [
  '', // epiphany-browser gives this instead of a real MIME type
  'text/plain',
  'text/html',
  'text/rtf',
  'application/rtf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // 'application/msword', 'application/vnd.ms-powerpoint', 'application/vnd.ms-excel'
  'application/vnd.oasis.opendocument.text',
  'application/x-latex',
  'application/x-tex',
];

const DocTranslationForm = ({
  srcLang,
  tgtLang,
  onCancel,
  setLoading,
}: {
  onCancel: () => void;
  srcLang: string;
  tgtLang: string;
  setLoading: (loading: boolean) => void;
}): React.ReactElement => {
  const { t } = useLocalization();
  const history = useHistory();

  React.useEffect(() => {
    const search = buildNewSearch(baseUrlParams({ srcLang, tgtLang }));
    history.replace({ search });
  }, [history, srcLang, tgtLang]);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const [error, setError] = React.useState<string | null>(null);
  const translationRef = React.useRef<CancelTokenSource | null>(null);

  const [progress, setProgress] = React.useState<number | null>(null);
  const [translation, setTranslation] = React.useState<{ href: string; name: string } | null>(null);

  const translate = React.useCallback(() => {
    if (inputRef.current?.files?.length !== 1) {
      setError(null);
      setProgress(null);
      setTranslation(null);
      return;
    }

    const file = inputRef.current.files[0];
    if (file.size > fileSizeLimit) {
      setError('File_Too_Large');
      return;
    }

    if (!allowedMimeTypes.includes(file.type)) {
      console.warn('Invalid MIME type', file.type, 'for translation');
      setError('Format_Not_Supported');
      return;
    }

    translationRef.current?.cancel();
    translationRef.current = null;

    const translateData = new FormData();
    translateData.append('langpair', `${srcLang}|${tgtLang}`);
    translateData.append('markUnknown', 'no');
    translateData.append('file', file);

    const source = axios.CancelToken.source();
    translationRef.current = source;
    setLoading(true);
    setProgress(0);

    void (async () => {
      try {
        const response = (
          await axios.post(`${Config.apyURL}/translateDoc`, translateData, {
            cancelToken: source.token,
            validateStatus: (status) => status == 200,
            onUploadProgress: ({ loaded, total }: ProgressEvent) => {
              setProgress(Math.floor((loaded / total) * 1000) / 10);
            },
            responseType: 'blob',
          })
        ).data as Blob;

        setTranslation({
          href: URL.createObjectURL(response),
          name: file.name,
        });

        setProgress(null);
        setError(null);
        setLoading(false);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.warn('Translation failed', error);
          setError('Not_Available');
          setLoading(false);
          setProgress(null);
        }
      }
    })();

    return () => translationRef.current?.cancel();
  }, [setLoading, srcLang, tgtLang]);

  React.useEffect(() => {
    window.addEventListener(TranslateEvent, translate, false);
    return () => window.removeEventListener(TranslateEvent, translate);
  }, [translate]);

  return (
    <Row>
      <Col md="6">
        <Card bg="light">
          <Card.Body>
            <input
              accept={allowedMimeTypes.filter((t) => t.length > 0).join(',')}
              autoFocus
              ref={inputRef}
              type="file"
            />
            <div className="my-2 d-flex flex-column justify-content-center" style={{ minHeight: '3rem' }}>
              {progress != null && <ProgressBar animated max={100} min={0} now={50} striped />}
              {error && <span className="text-danger lead">{t(error)}</span>}
            </div>
            <p dangerouslySetInnerHTML={{ __html: t('Supported_Formats') }} />
            <Button
              className="position-absolute"
              onClick={onCancel}
              size="sm"
              style={{ bottom: '-6px', right: '20px' }}
              variant="secondary"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> {t('Cancel')}
            </Button>
          </Card.Body>
        </Card>
      </Col>
      <Col md="6">
        {translation && (
          <a className="text-center lead" download={translation.name} href={translation.href}>
            <FontAwesomeIcon icon={faFileDownload} /> {translation.name}
          </a>
        )}
      </Col>
    </Row>
  );
};

export const Path = '/docTranslation';

export default DocTranslationForm;
