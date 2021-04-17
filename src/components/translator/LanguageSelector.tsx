import * as React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

import { t, tLang } from '../../util/localization';
import { Pairs } from '.';

const LanguageSelector = ({
  srcLang,
  setSrcLang,
  dstLang,
  setDstLang,
  recentSrcLangs,
  recentDstLangs,
  onTranslate,
}: {
  srcLang: string;
  setSrcLang: React.Dispatch<React.SetStateAction<string>>;
  dstLang: string;
  setDstLang: React.Dispatch<React.SetStateAction<string>>;
  recentSrcLangs: Array<string>;
  recentDstLangs: Array<string>;
  onTranslate: () => void;
}): React.ReactElement => {
  return (
    <form>
      <Form.Group className="d-flex d-md-none flex-column">
        <div className="d-flex flex-wrap">
          <Form.Control
            as="select"
            size="sm"
            value={srcLang}
            className="d-inline-block mb-2 mr-2"
            style={{ maxWidth: '60%' }}
            onChange={({ target: { value } }) => setSrcLang(value)}
          >
            {Object.keys(Pairs)
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
          <Button type="button" variant="secondary" size="sm" className="mb-2">
            <FontAwesomeIcon icon={faExchangeAlt} />
          </Button>
          <Form.Control
            as="select"
            size="sm"
            value={dstLang}
            className="d-inline-block"
            style={{ maxWidth: '60%' }}
            onChange={({ target: { value } }) => setDstLang(value)}
          >
            {[...new Set(([] as Array<string>).concat(...Object.values(Pairs).map((ls) => Array.from(ls))))]
              .map((code) => [code, tLang(code)])
              .sort(([, a], [, b]) => {
                return a.toLowerCase().localeCompare(b.toLowerCase());
              })
              .map(([code, name]) => (
                <option key={code} value={code} disabled={!Pairs[srcLang].has(code)}>
                  {name}
                </option>
              ))}
          </Form.Control>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="btn-sm translateBtn ml-auto"
            onClick={onTranslate}
          >
            {t('Translate')}
          </Button>
        </div>
      </Form.Group>
      <Form.Group className="row d-none d-md-block">
        <Col xs="6" className="d-inline-flex align-items-start justify-content-between">
          <ButtonGroup className="d-flex flex-wrap pl-0">
            {recentSrcLangs.map((lang) => (
              <Button
                key={lang}
                type="button"
                variant="secondary"
                size="sm"
                className="language-button"
                active={lang === srcLang}
                onClick={({ currentTarget }) => {
                  setSrcLang(lang);
                  currentTarget.blur();
                }}
              >
                {tLang(lang)}
              </Button>
            ))}
            <Button type="button" variant="secondary" size="sm">
              {t('Detect_Language')}
            </Button>
            <DropdownButton
              size="sm"
              variant="secondary"
              title=""
              className="language-dropdown-button"
            ></DropdownButton>
          </ButtonGroup>
          <Button type="button" variant="secondary" size="sm">
            <FontAwesomeIcon icon={faExchangeAlt} />
          </Button>
        </Col>
        <Col xs="6" className="d-inline-flex align-items-start justify-content-between">
          <ButtonGroup className="d-flex flex-wrap pl-0">
            {recentDstLangs.map((lang) => (
              <Button
                key={lang}
                type="button"
                variant="secondary"
                size="sm"
                className="language-button"
                active={lang === dstLang}
                onClick={({ currentTarget }) => {
                  setDstLang(lang);
                  currentTarget.blur();
                }}
                disabled={!Pairs[srcLang].has(lang)}
              >
                {tLang(lang)}
              </Button>
            ))}
            <DropdownButton
              size="sm"
              variant="secondary"
              title=""
              className="language-dropdown-button"
            ></DropdownButton>
          </ButtonGroup>
          <Button type="button" size="sm" onClick={onTranslate}>
            {t('Translate')}
          </Button>
        </Col>
      </Form.Group>
    </form>
  );
};

export default LanguageSelector;
