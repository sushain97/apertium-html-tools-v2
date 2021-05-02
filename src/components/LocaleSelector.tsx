import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

import { LocaleContext } from '../context';
import locales from '../strings/locales.json';

const LocaleSelector = ({
  setLocale,
  inverse,
}: {
  inverse?: boolean;
  setLocale: React.Dispatch<React.SetStateAction<string>>;
}): React.ReactElement => {
  const locale = React.useContext(LocaleContext);

  return (
    <div className="mt-2">
      <FontAwesomeIcon
        className="float-right ml-2"
        icon={faGlobe}
        inverse={inverse}
        style={{
          fontSize: '25px',
          height: '25px',
        }}
      />
      {/* eslint-disable-next-line jsx-a11y/no-onchange */}
      <select
        className="float-right"
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
    </div>
  );
};

export default LocaleSelector;
