import './bootstrap.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Navbar from './components/navbar';

ReactDOM.render(
  <>
    <Navbar />
  </>,
  document.getElementById('react-mount'),
);
