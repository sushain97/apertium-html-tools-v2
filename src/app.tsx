import './bootstrap.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Navbar from './components/navbar';
import { LocaleContext } from './context';

const App = () => {
  const [locale, updateLocale] = React.useState<string>('eng');

  return (
    <LocaleContext.Provider value={locale}>
      <Navbar updateLocale={updateLocale} />
    </LocaleContext.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('react-mount'));
