import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

import { LocaleContext } from '../context';
import locales from '../strings/locales.json';

const LocaleSelector = ({
  setLocale,
}: {
  setLocale: React.Dispatch<React.SetStateAction<string>>;
}): React.ReactElement => {
  const locale = React.useContext(LocaleContext);

  return (
    <>
      <FontAwesomeIcon
        icon={faGlobe}
        size="2x"
        inverse
        className="float-right pt-2"
        style={{ padding: '0 5px 0 0', marginLeft: '0.3em', marginTop: '1px' }}
      ></FontAwesomeIcon>
      <select
        onChange={({ target: { value } }) => setLocale(value)}
        value={locale}
        className="float-right mt-2"
        style={{
          fontSize: '14px',
          height: '25px',
        }}
      >
        {Object.entries(locales)
          .sort(([, a], [, b]) => {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          })
          .map(([locale, name]) => (
            <option value={locale} key={locale}>
              {name}
            </option>
          ))}
      </select>
    </>
  );
};

export default LocaleSelector;
