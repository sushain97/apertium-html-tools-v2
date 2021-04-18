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
        className="float-right pt-2"
        icon={faGlobe}
        inverse
        size="2x"
        style={{ padding: '0 5px 0 0', marginLeft: '0.3em', marginTop: '1px' }}
       />
      <select
        className="float-right mt-2"
        onChange={({ target: { value } }) => setLocale(value)}
        style={{
          fontSize: '14px',
          height: '25px',
        }}
        value={locale}
      >
        {Object.entries(locales)
          .sort(([, a], [, b]) => {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          })
          .map(([locale, name]) => (
            <option key={locale} value={locale}>
              {name}
            </option>
          ))}
      </select>
    </>
  );
};

export default LocaleSelector;
