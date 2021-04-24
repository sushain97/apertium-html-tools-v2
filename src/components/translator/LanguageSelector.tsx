import * as React from 'react';
import Button, { ButtonProps } from 'react-bootstrap/Button';
import { faExchangeAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import classNames from 'classnames';

import { Pairs, SrcLangs, TgtLangs, isPair } from '.';
import { isVariant, langDirection, parentLang, toAlpha2Code, variantSeperator } from '../../util/languages';
import { LocaleContext } from '../../context';
import { useLocalization } from '../../util/localization';

// TODO: [parity] language detection

type Props = {
  pairs: Pairs;
  srcLang: string;
  setSrcLang: (code: string) => void;
  tgtLang: string;
  setTgtLang: (code: string) => void;
  recentSrcLangs: Array<string>;
  recentTgtLangs: Array<string>;
  onTranslate: () => void;
  loading: boolean;
};

const langListIdealRows = 12,
  langListMaxWidths = 850,
  langListMaxColumns = 6,
  langListsBuffer = 50;
const langListMinColumnWidth = langListMaxWidths / langListMaxColumns;

const TranslateButton = (props: { loading: boolean; onTranslate: () => void } & ButtonProps): React.ReactElement => {
  const { t } = useLocalization();
  const { loading, onTranslate, ...buttonProps } = props;

  return (
    <Button
      className="btn-sm ml-auto"
      onClick={({ currentTarget }) => {
        onTranslate();
        currentTarget.blur();
      }}
      size="sm"
      type="button"
      {...buttonProps}
    >
      {loading ? (
        <>
          <FontAwesomeIcon className="mr-1" icon={faSpinner} spin />{' '}
        </>
      ) : null}
      {t('Translate')}
    </Button>
  );
};

const MobileLanguageSelector = ({
  pairs,
  srcLang,
  setSrcLang,
  tgtLang,
  setTgtLang,
  onTranslate,
  srcLangs,
  tgtLangs,
  swapLangs,
  loading,
}: Props & {
  srcLangs: Array<[string, string]>;
  tgtLangs: Array<[string, string]>;
  swapLangs?: () => void;
}): React.ReactElement => {
  return (
    <Form.Group className="d-flex d-md-none flex-column">
      <div className="d-flex flex-wrap">
        <Form.Control
          as="select"
          className="d-inline-block mb-2 mr-2"
          onChange={({ target: { value } }) => setSrcLang(value)}
          size="sm"
          style={{ maxWidth: '60%' }}
          value={srcLang}
        >
          {srcLangs.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </Form.Control>
        <Button className="mb-2" disabled={!swapLangs} onClick={swapLangs} size="sm" type="button" variant="secondary">
          <FontAwesomeIcon icon={faExchangeAlt} />
        </Button>
        <Form.Control
          as="select"
          className="d-inline-block"
          onChange={({ target: { value } }) => setTgtLang(value)}
          size="sm"
          style={{ maxWidth: '60%' }}
          value={tgtLang}
        >
          {tgtLangs.map(([code, name]) => (
            <option disabled={!pairs[srcLang].has(code)} key={code} value={code}>
              {name}
            </option>
          ))}
        </Form.Control>
        <TranslateButton loading={loading} onTranslate={onTranslate} variant="primary" />
      </div>
    </Form.Group>
  );
};

const DesktopLanguageSelector = ({
  pairs,
  srcLang,
  setSrcLang,
  tgtLang,
  setTgtLang,
  onTranslate,
  recentTgtLangs,
  recentSrcLangs,
  srcLangs,
  tgtLangs,
  swapLangs,
  loading,
}: Props & {
  srcLangs: Array<[string, string]>;
  tgtLangs: Array<[string, string]>;
  swapLangs?: () => void;
}): React.ReactElement => {
  const locale = React.useContext(LocaleContext);
  const { t, tLang } = useLocalization();

  const srcLangsDropdownTriggerRef = React.createRef<HTMLDivElement>();
  const tgtLangsDropdownTriggerRef = React.createRef<HTMLDivElement>();

  const [numSrcCols, setNumSrcCols] = React.useState(1);
  const [numTgtCols, setNumTgtCols] = React.useState(1);

  React.useLayoutEffect(() => {
    const refreshSizes = () => {
      let maxSrcLangsWidth, maxTgtLangsWidth;

      // Figure out how much space is actually available for the columns.
      const srcLangsDropdownOffset = srcLangsDropdownTriggerRef.current?.getBoundingClientRect().x || 0;
      const tgtLangsDropdownOffset = tgtLangsDropdownTriggerRef.current?.getBoundingClientRect().x || 0;
      const srcLangsDropdownWidth = srcLangsDropdownTriggerRef.current?.offsetWidth || 0;
      const tgtLangsDropdownWidth = tgtLangsDropdownTriggerRef.current?.offsetWidth || 0;
      if (langDirection(locale) === 'ltr') {
        maxSrcLangsWidth = window.innerWidth - srcLangsDropdownOffset - langListsBuffer;
        maxTgtLangsWidth = tgtLangsDropdownOffset + tgtLangsDropdownWidth - langListsBuffer;
      } else {
        maxSrcLangsWidth = srcLangsDropdownOffset + srcLangsDropdownWidth - langListsBuffer;
        maxTgtLangsWidth = window.innerWidth - tgtLangsDropdownOffset - langListsBuffer;
      }

      // Then, prevent all the columns from getting too wide.
      maxSrcLangsWidth = Math.min(langListMaxWidths, maxSrcLangsWidth);
      maxTgtLangsWidth = Math.min(langListMaxWidths, maxTgtLangsWidth);

      // Finally, pick the ideal number of columns (up to limitations from the
      // maximum overall width and the imposed maximum).
      setNumSrcCols(
        Math.min(
          Math.ceil(srcLangs.length / langListIdealRows),
          Math.floor(maxSrcLangsWidth / langListMinColumnWidth),
          langListMaxColumns,
        ),
      );
      setNumTgtCols(
        Math.min(
          Math.ceil(tgtLangs.length / langListIdealRows),
          Math.floor(maxTgtLangsWidth / langListMinColumnWidth),
          langListMaxColumns,
        ),
      );
    };

    window.addEventListener('resize', refreshSizes);
    refreshSizes();

    return () => window.removeEventListener('resize', refreshSizes);
  }, [locale, tgtLangs.length, srcLangs.length, tgtLangsDropdownTriggerRef, srcLangsDropdownTriggerRef]);

  const [srcLangsPerCol, tgtLangsPerCol] = React.useMemo(() => {
    let srcLangsPerCol = Math.ceil(srcLangs.length / numSrcCols),
      tgtLangsPerCol = Math.ceil(tgtLangs.length / numTgtCols);

    for (let i = 0; i < numSrcCols; i++) {
      while (i * srcLangsPerCol < srcLangs.length && isVariant(srcLangs[i * srcLangsPerCol][0])) {
        srcLangsPerCol++;
      }
    }

    for (let i = 0; i < numTgtCols; i++) {
      while (i * tgtLangsPerCol < tgtLangs.length && isVariant(tgtLangs[i * tgtLangsPerCol][0])) {
        tgtLangsPerCol++;
      }
    }

    return [srcLangsPerCol, tgtLangsPerCol];
  }, [numSrcCols, numTgtCols, srcLangs, tgtLangs]);

  const srcLangCols = [];
  const tgtLangCols = [];

  for (let i = 0; i < numSrcCols; i++) {
    const numSrcLang = srcLangsPerCol * i;
    const srcLangElems: Array<React.ReactElement> = [];

    for (let j = numSrcLang; j < srcLangs.length && j < numSrcLang + srcLangsPerCol; j++) {
      const [code, name] = srcLangs[j];
      srcLangElems.push(
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
          className={classNames('language-name', { 'variant-language-name': isVariant(code) })}
          key={code}
          onClick={() => {
            setSrcLang(code);
            document.body.click();
          }}
          role="button"
          tabIndex={0}
        >
          {name}
        </div>,
      );
    }
    srcLangCols.push(
      <div className="language-name-col" key={i} style={{ width: `${100.0 / numSrcCols}%` }}>
        {srcLangElems}
      </div>,
    );
  }

  for (let i = 0; i < numTgtCols; i++) {
    const numTgtLang = tgtLangsPerCol * i;
    const tgtLangElems: Array<React.ReactElement> = [];

    for (let j = numTgtLang; j < tgtLangs.length && j < numTgtLang + tgtLangsPerCol; j++) {
      const [code, name] = tgtLangs[j];
      const valid = pairs[srcLang].has(code);
      tgtLangElems.push(
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
          className={classNames('language-name', {
            'variant-language-name': isVariant(code),
            'text-muted': !valid,
          })}
          key={code}
          onClick={
            valid
              ? () => {
                  setTgtLang(code);
                  document.body.click();
                }
              : undefined
          }
          role="button"
          tabIndex={0}
        >
          {name}
        </div>,
      );
    }
    tgtLangCols.push(
      <div className="language-name-col" key={i} style={{ width: `${100.0 / numTgtCols}%` }}>
        {tgtLangElems}
      </div>,
    );
  }

  return (
    <Form.Group className="row d-none d-md-block">
      <Col className="d-inline-flex align-items-start justify-content-between" xs="6">
        <ButtonGroup className="d-flex flex-wrap pl-0">
          {recentSrcLangs.map((lang) => (
            <Button
              active={lang === srcLang}
              className="language-button"
              key={lang}
              onClick={({ currentTarget }) => {
                setSrcLang(lang);
                currentTarget.blur();
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              {tLang(lang)}
            </Button>
          ))}
          <Button size="sm" type="button" variant="secondary">
            {t('Detect_Language')}
          </Button>
          <DropdownButton
            className="language-dropdown-button"
            ref={srcLangsDropdownTriggerRef}
            size="sm"
            title=""
            variant="secondary"
          >
            <Row className="d-flex" style={{ minWidth: numSrcCols * langListMinColumnWidth }}>
              {srcLangCols}
            </Row>
          </DropdownButton>
        </ButtonGroup>
        <Button disabled={!swapLangs} onClick={swapLangs} size="sm" type="button" variant="secondary">
          <FontAwesomeIcon icon={faExchangeAlt} />
        </Button>
      </Col>
      <Col className="d-inline-flex align-items-start justify-content-between" xs="6">
        <ButtonGroup className="d-flex flex-wrap pl-0">
          {recentTgtLangs.map((lang) => (
            <Button
              active={lang === tgtLang}
              className="language-button"
              disabled={!isPair(pairs, srcLang, lang)}
              key={lang}
              onClick={({ currentTarget }) => {
                setTgtLang(lang);
                currentTarget.blur();
              }}
              size="sm"
              type="button"
              variant="secondary"
            >
              {tLang(lang)}
            </Button>
          ))}
          <DropdownButton
            alignRight
            className="language-dropdown-button"
            ref={tgtLangsDropdownTriggerRef}
            size="sm"
            title=""
            variant="secondary"
          >
            <Row className="d-flex" style={{ minWidth: numTgtCols * langListMinColumnWidth }}>
              {tgtLangCols}
            </Row>
          </DropdownButton>
        </ButtonGroup>
        <TranslateButton loading={loading} onTranslate={onTranslate} variant="primary" />
      </Col>
    </Form.Group>
  );
};

const LanguageSelector = (props: Props): React.ReactElement => {
  const { tLang } = useLocalization();

  const { pairs, srcLang, setSrcLang, tgtLang, setTgtLang } = props;

  const swapLangs = isPair(pairs, tgtLang, srcLang)
    ? () => {
        setSrcLang(tgtLang);
        setTgtLang(srcLang);
      }
    : undefined;

  const locale = React.useContext(LocaleContext);
  let sortLocale: string | undefined = toAlpha2Code(locale);
  try {
    'a'.localeCompare('b', sortLocale);
  } catch (e) {
    sortLocale = undefined;
  }

  const compareLangCodes = React.useCallback(
    (a: string, b: string): number => {
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
    },
    [sortLocale, tLang],
  );

  const srcLangs: Array<[string, string]> = React.useMemo(
    () => [...SrcLangs].sort(compareLangCodes).map((code) => [code, tLang(code)]),
    [compareLangCodes, tLang],
  );

  const tgtLangs: Array<[string, string]> = React.useMemo(
    () =>
      [...TgtLangs]
        .sort((a, b) => {
          const possibleTgtLangs = Array.from(pairs[srcLang]) || [];

          const isFamilyPossible = (lang: string, parent: string) => {
            return (
              isPair(pairs, srcLang, lang) ||
              possibleTgtLangs.includes(parent) ||
              possibleTgtLangs.some((possibleLang) => parentLang(possibleLang) === parent)
            );
          };

          const aParent = parentLang(a),
            bParent = parentLang(b);
          const aFamilyPossible = isFamilyPossible(a, aParent),
            bFamilyPossible = isFamilyPossible(b, bParent);
          if (aFamilyPossible === bFamilyPossible) {
            if (aParent === bParent) {
              const aVariant = isVariant(a),
                bVariant = isVariant(b);
              if (aVariant && bVariant) {
                const aPossible = isPair(pairs, srcLang, a),
                  bPossible = isPair(pairs, srcLang, b);
                if (aPossible === bPossible) {
                  return compareLangCodes(a, b);
                } else if (aPossible) {
                  return -1;
                } else {
                  return 1;
                }
              } else if (aVariant) {
                return 1;
              } else {
                return -1;
              }
            } else {
              return compareLangCodes(a, b);
            }
          } else if (aFamilyPossible) {
            return -1;
          } else {
            return 1;
          }
        })
        .map((code) => [code, tLang(code)]),
    [compareLangCodes, pairs, srcLang, tLang],
  );

  const sharedProps = {
    ...props,
    srcLangs,
    tgtLangs,
    swapLangs,
  };

  return (
    <>
      <MobileLanguageSelector {...sharedProps} />
      <DesktopLanguageSelector {...sharedProps} />
    </>
  );
};

export default LanguageSelector;
