import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';

import Generator from './Generator';

const renderGenerator = () =>
  render(
    <Router history={createMemoryHistory()}>
      <Generator />
    </Router>,
  );

it('allows selecting a language', () => {
  renderGenerator();

  const selector = screen.getByRole('combobox');
  userEvent.selectOptions(selector, screen.getByRole('option', { name: 'English-Default' }));

  expect((selector as HTMLSelectElement).value).toBe('eng');
});

it('allows typing an input', () => {
  renderGenerator();

  const input = '^kick<vblex><pp>$';

  const textbox = screen.getByRole('textbox');
  userEvent.type(textbox, input);

  expect((textbox as HTMLSelectElement).value).toBe(input);
});
