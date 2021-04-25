import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';

import Analyzer from './Analyzer';

const renderAnalyzer = () =>
  render(
    <Router history={createMemoryHistory()}>
      <Analyzer />
    </Router>,
  );

it('allows selecting a language', () => {
  renderAnalyzer();

  const selector = screen.getByRole('combobox');
  userEvent.selectOptions(selector, screen.getByRole('option', { name: 'English-Default' }));

  expect((selector as HTMLSelectElement).value).toBe('eng');
});

it('allows typing an input', () => {
  renderAnalyzer();

  const input = 'kick';

  const textbox = screen.getByRole('textbox');
  userEvent.type(textbox, input);

  expect((textbox as HTMLSelectElement).value).toBe(input);
});
