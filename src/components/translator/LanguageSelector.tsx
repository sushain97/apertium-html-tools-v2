import * as React from 'react';
import classNames from 'classnames';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

import { t, tLang } from '../../util/localization';
import { langDirection, isVariant, toAlpha2Code, variantSeperator } from '../../util/languages';
import { LocaleContext } from '../../context';
import { Pairs, SrcLangs, DstLangs, isPair } from '.';

type Props = {
  srcLang: string;
  setSrcLang: (code: string) => void;
  dstLang: string;
  setDstLang: (code: string) => void;
  recentSrcLangs: Array<string>;
  recentDstLangs: Array<string>;
  onTranslate: () => void;
};

const langListIdealRows = 12,
  langListMaxWidths = 850,
  langListMaxColumns = 6,
  langListsBuffer = 50;
const langListMinColumnWidth = langListMaxWidths / langListMaxColumns;

const MobileLanguageSelector = ({
  srcLang,
  setSrcLang,
  dstLang,
  setDstLang,
  onTranslate,
  srcLangs,
  dstLangs,
  swapLangs,
}: Props & {
  srcLangs: Array<[string, string]>;
  dstLangs: Array<[string, string]>;
  swapLangs?: () => void;
}): React.ReactElement => {
  return (
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
          {srcLangs.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </Form.Control>
        <Button type="button" variant="secondary" size="sm" className="mb-2" onClick={swapLangs} disabled={!swapLangs}>
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
          {dstLangs.map(([code, name]) => (
            <option key={code} value={code} disabled={!Pairs[srcLang].has(code)}>
              {name}
            </option>
          ))}
        </Form.Control>
        <Button type="button" variant="primary" size="sm" className="btn-sm translateBtn ml-auto" onClick={onTranslate}>
          {t('Translate')}
        </Button>
      </div>
    </Form.Group>
  );
};

const DesktopLanguageSelector = ({
  srcLang,
  setSrcLang,
  dstLang,
  setDstLang,
  onTranslate,
  recentDstLangs,
  recentSrcLangs,
  srcLangs,
  dstLangs,
  swapLangs,
}: Props & {
  srcLangs: Array<[string, string]>;
  dstLangs: Array<[string, string]>;
  swapLangs?: () => void;
}): React.ReactElement => {
  const locale = React.useContext(LocaleContext);

  const srcLangsDropdownTriggerRef = React.createRef<HTMLDivElement>();
  const dstLangsDropdownTriggerRef = React.createRef<HTMLDivElement>();

  const [numSrcCols, setNumSrcCols] = React.useState(1);
  const [numDstCols, setNumDstCols] = React.useState(1);

  React.useLayoutEffect(() => {
    const refreshSizes = () => {
      let maxSrcLangsWidth, maxDstLangsWidth;

      // Figure out how much space is actually available for the columns.
      const srcLangsDropdownOffset = srcLangsDropdownTriggerRef.current?.getBoundingClientRect().x || 0;
      const dstLangsDropdownOffset = dstLangsDropdownTriggerRef.current?.getBoundingClientRect().x || 0;
      const srcLangsDropdownWidth = srcLangsDropdownTriggerRef.current?.offsetWidth || 0;
      const dstLangsDropdownWidth = dstLangsDropdownTriggerRef.current?.offsetWidth || 0;
      if (langDirection(locale) === 'ltr') {
        maxSrcLangsWidth = window.innerWidth - srcLangsDropdownOffset - langListsBuffer;
        maxDstLangsWidth = dstLangsDropdownOffset + dstLangsDropdownWidth - langListsBuffer;
        console.log(dstLangsDropdownOffset, dstLangsDropdownWidth, maxDstLangsWidth);
      } else {
        maxSrcLangsWidth = srcLangsDropdownOffset + srcLangsDropdownWidth - langListsBuffer;
        maxDstLangsWidth = window.innerWidth - dstLangsDropdownOffset - langListsBuffer;
      }

      // Then, prevent all the columns from getting too wide.
      maxSrcLangsWidth = Math.min(langListMaxWidths, maxSrcLangsWidth);
      maxDstLangsWidth = Math.min(langListMaxWidths, maxDstLangsWidth);

      // Finally, pick the ideal number of columns (up to limitations from the
      // maximum overall width and the imposed maximum).
      setNumSrcCols(
        Math.min(
          Math.ceil(srcLangs.length / langListIdealRows),
          Math.floor(maxSrcLangsWidth / langListMinColumnWidth),
          langListMaxColumns,
        ),
      );
      setNumDstCols(
        Math.min(
          Math.ceil(dstLangs.length / langListIdealRows),
          Math.floor(maxDstLangsWidth / langListMinColumnWidth),
          langListMaxColumns,
        ),
      );
    };

    window.addEventListener('resize', refreshSizes);
    refreshSizes();

    return () => window.removeEventListener('resize', refreshSizes);
  }, [locale, dstLangs.length, srcLangs.length, dstLangsDropdownTriggerRef, srcLangsDropdownTriggerRef]);

  let srcLangsPerCol = Math.ceil(srcLangs.length / numSrcCols),
    dstLangsPerCol = Math.ceil(dstLangs.length / numDstCols);

  for (let i = 0; i < numSrcCols; i++) {
    while (i * srcLangsPerCol < srcLangs.length && isVariant(srcLangs[i * srcLangsPerCol][0])) {
      srcLangsPerCol++;
    }
  }

  for (let i = 0; i < numDstCols; i++) {
    while (i * dstLangsPerCol < dstLangs.length && isVariant(dstLangs[i * dstLangsPerCol][0])) {
      dstLangsPerCol++;
    }
  }

  const srcLangCols = [];
  const dstLangCols = [];

  for (let i = 0; i < numSrcCols; i++) {
    const numSrcLang = srcLangsPerCol * i;
    const srcLangElems: Array<React.ReactElement> = [];

    for (let j = numSrcLang; j < srcLangs.length && j < numSrcLang + srcLangsPerCol; j++) {
      const [code, name] = srcLangs[j];
      srcLangElems.push(
        <div
          key={code}
          className={classNames('language-name', { 'variant-language-name': isVariant(code) })}
          onClick={() => {
            setSrcLang(code);
            document.body.click();
          }}
        >
          {name}
        </div>,
      );
    }
    srcLangCols.push(
      <div key={i} className="language-name-col" style={{ width: `${100.0 / numSrcCols}%` }}>
        {srcLangElems}
      </div>,
    );
  }

  for (let i = 0; i < numDstCols; i++) {
    const numDstLang = dstLangsPerCol * i;
    const dstLangElems: Array<React.ReactElement> = [];

    for (let j = numDstLang; j < dstLangs.length && j < numDstLang + dstLangsPerCol; j++) {
      const [code, name] = dstLangs[j];
      const valid = Pairs[srcLang].has(code);
      dstLangElems.push(
        <div
          key={code}
          className={classNames('language-name', {
            'variant-language-name': isVariant(code),
            'text-muted': !valid,
          })}
          onClick={
            valid
              ? () => {
                  setDstLang(code);
                  document.body.click();
                }
              : undefined
          }
        >
          {name}
        </div>,
      );
    }
    dstLangCols.push(
      <div key={i} className="language-name-col" style={{ width: `${100.0 / numDstCols}%` }}>
        {dstLangElems}
      </div>,
    );
  }

  return (
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
            ref={srcLangsDropdownTriggerRef}
          >
            <Row className="d-flex" style={{ minWidth: numSrcCols * langListMinColumnWidth }}>
              {srcLangCols}
            </Row>
          </DropdownButton>
        </ButtonGroup>
        <Button type="button" variant="secondary" size="sm" onClick={swapLangs} disabled={!swapLangs}>
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
            alignRight
            ref={dstLangsDropdownTriggerRef}
          >
            <Row className="d-flex" style={{ minWidth: numDstCols * langListMinColumnWidth }}>
              {dstLangCols}
            </Row>
          </DropdownButton>
        </ButtonGroup>
        <Button type="button" size="sm" onClick={onTranslate}>
          {t('Translate')}
        </Button>
      </Col>
    </Form.Group>
  );
};

const LanguageSelector = (props: Props): React.ReactElement => {
  const { srcLang, setSrcLang, dstLang, setDstLang } = props;

  const swapLangs = isPair(dstLang, srcLang)
    ? () => {
        setSrcLang(dstLang);
        setDstLang(srcLang);
      }
    : undefined;

  const locale = React.useContext(LocaleContext);
  let sortLocale: string | undefined = toAlpha2Code(locale);
  try {
    'a'.localeCompare('b', sortLocale);
  } catch (e) {
    sortLocale = undefined;
  }

  const compareLangCodes = (a: string, b: string): number => {
    const aVariant = a.split(variantSeperator, 2),
      bVariant = b.split(variantSeperator, 2);
    const directCompare = tLang(aVariant[0]).localeCompare(tLang(bVariant[0]), sortLocale);

    if (aVariant[1] && bVariant[1] && aVariant[0] === bVariant[0]) {
      return directCompare;
    } else if (aVariant[1] && aVariant[0] === b) {
      return 1;
    } else if (bVariant[1] && bVariant[0] === a) {
      return -1;
    } else {
      return directCompare;
    }
  };

  const srcLangs: Array<[string, string]> = [...SrcLangs]
    .sort(compareLangCodes)
    .map((code) => [code, tLang(code)]) as Array<[string, string]>;
  const dstLangs: Array<[string, string]> = [...DstLangs]
    .map((code) => [code, tLang(code)])
    .sort(([, a], [, b]) => {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }) as Array<[string, string]>;

  const sharedProps = {
    ...props,
    srcLangs,
    dstLangs,
    swapLangs,
  };

  return (
    <form>
      <MobileLanguageSelector {...sharedProps} />
      <DesktopLanguageSelector {...sharedProps} />
    </form>
  );
};

export default LanguageSelector;
