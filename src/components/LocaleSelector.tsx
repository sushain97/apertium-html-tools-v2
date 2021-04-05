import * as React from 'react';

import { LocaleContext } from '../context';
import locales from '../strings/locales.json';

export default ({ setLocale }: { setLocale: React.Dispatch<React.SetStateAction<string>> }) => {
  const locale = React.useContext(LocaleContext);

  return (
    <>
      <i
        className="fa fa-globe fa-2x fa-inverse float-right locale-globe pt-2 pr-1"
        style={{ color: '#fff', fontSize: '1.8em', padding: '0 5px 0 0', marginLeft: '0.3em' }}
      ></i>
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
