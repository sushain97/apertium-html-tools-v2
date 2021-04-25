import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';

import Sandbox from './Sandbox';

const renderSandbox = () =>
  render(
    <Router history={createMemoryHistory()}>
      <Sandbox />
    </Router>,
  );

it('allows typing an input', () => {
  renderSandbox();

  const input = '^kick<vblex><pp>$';

  const textbox = screen.getByRole('textbox');
  userEvent.type(textbox, input);

  expect((textbox as HTMLSelectElement).value).toBe(input);
});
