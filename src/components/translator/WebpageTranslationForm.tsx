import * as React from 'react';
import axios, { CancelTokenSource } from 'axios';
import { faArrowLeft, faLink } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import classNames from 'classnames';

import { MaxURLLength, buildNewUrl, getUrlParam } from '../../util/url';
import { apyFetch } from '../../util';
import { baseUrlParams } from '.';
import useLocalStorage from '../../util/useLocalStorage';
import { useLocalization } from '../../util/localization';

const urlUrlParam = 'qW';

// TODO: translation

const WebpageTranslationForm = ({
  cancelLink,
  srcLang,
  tgtLang,
}: {
  cancelLink: string;
  srcLang: string;
  tgtLang: string;
}): React.ReactElement => {
  const { t } = useLocalization();

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const [url, setUrl] = useLocalStorage('srcUrl', '', { overrideValue: getUrlParam(urlUrlParam) });
  React.useEffect(() => {
    const baseParams = baseUrlParams({ srcLang, tgtLang });
    let newUrl = buildNewUrl({ ...baseParams, [urlUrlParam]: url });
    if (newUrl.length > MaxURLLength) {
      newUrl = buildNewUrl(baseParams);
    }
    window.history.replaceState({}, document.title, newUrl);
  }, [srcLang, tgtLang, url]);

  const [error, setError] = React.useState(false);
  const translationRef = React.useRef<CancelTokenSource | null>(null);

  const [translation, setTranslation] = React.useState<{ html: string; url: string } | null>(null);

  const translate = React.useCallback(
    (url: string) => {
      // TOOD: Check for valid URL.
      void (async () => {
        if (url.trim().length == 0) {
          setError(false);
          setTranslation(null);
          return;
        }

        translationRef.current?.cancel();
        translationRef.current = null;

        const [ref, request] = apyFetch('translatePage', {
          url,
          langpair: `${srcLang}|${tgtLang}`,
          markUnknown: 'no',
        });
        translationRef.current = ref;

        try {
          const response = (await request).data as {
            responseData: { translatedText: string };
            responseDetails: unknown;
            responseStatus: number;
          };
          setTranslation({ url, html: response.responseData.translatedText });
          setError(false);
        } catch (error) {
          if (!axios.isCancel(error)) {
            console.warn('Translation failed', error);
            setError(true);
          }
        }
      })();
    },
    [srcLang, tgtLang],
  );

  React.useEffect(() => {
    const iframe = iframeRef.current;

    if (!translation || !iframe || !iframe.contentWindow) {
      return;
    }

    // Pages like https://goo.gl/PiZyW3 insert noise using document.write that
    // 1. makes things enormously slow, and 2. completely mess up styling so e.g. you
    // have to scroll through a full screen of whitespace before reaching content.
    // This might mess things up some places – needs testing – but on the other hand
    // most uses of document.write are evil.
    const cleanHtml = translation.html.replace(/document\.write\(/g, 'console.log("document.write "+');

    const iframeDoc = iframe.contentWindow.document;

    iframeDoc.open();
    iframeDoc.write(cleanHtml);
    iframeDoc.close();

    const onLoad = () => {
      const baseElem = iframeDoc.createElement('base');
      baseElem.href = translation.url;
      iframeDoc.querySelector('head')?.appendChild(baseElem);

      iframeDoc.querySelectorAll('a').forEach((link) => {
        const href = link.href;
        link.addEventListener('click', (event) => {
          setUrl(href);
          translate(href);
          event.preventDefault();
        });
        link.href = '#';
        link.target = '';
      });

      if (iframeDoc.querySelector('body')?.innerText.trim().length === 0) {
        console.warn('Translated webpage has empty body');
        setError(true);
      }
    };

    iframe.contentWindow.addEventListener('load', onLoad);
    return () => iframe.contentWindow?.removeEventListener('load', onLoad);
  }, [translation, setUrl, translate]);

  React.useEffect(() => {
    const translateHandler = () => translate(url);
    window.addEventListener('translate', translateHandler, false);
    return () => window.removeEventListener('translate', translateHandler);
  }, [translate, url]);

  // `url` is explicitly excluded here to avoid making a translate request
  // on each keypress.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => void translate(url), [srcLang, tgtLang]);

  return (
    <Row>
      <Col sm="12">
        <div className="d-inline-flex mb-2 w-100">
          <Button href={cancelLink} variant="secondary">
            <FontAwesomeIcon icon={faArrowLeft} /> {t('Cancel')}
          </Button>
          <InputGroup className="ml-3">
            <InputGroup.Prepend>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faLink} />
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              autoComplete="url"
              onChange={({ currentTarget: { value } }) => setUrl(value)}
              placeholder="URL ⏎"
              required
              value={url}
            />
          </InputGroup>
        </div>
        {error ? <div className="translated-webpage text-danger w-100 pl-2 pt-2">{t('Not_Available')}</div> : null}
        {
          <iframe
            className={classNames('translated-webpage w-100', { 'd-none': translation == null || error })}
            ref={iframeRef}
            title="translated-webpage"
          />
        }
      </Col>
    </Row>
  );
};

export default WebpageTranslationForm;
