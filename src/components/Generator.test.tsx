import * as React from 'react';
import { MemoryHistory, MemoryHistoryBuildOptions, createMemoryHistory } from 'history';
import { cleanup, render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import Generator from './Generator';

const input = 'foobar';

const renderGenerator = (options?: MemoryHistoryBuildOptions): MemoryHistory => {
  const history = createMemoryHistory(options);

  render(
    <Router history={history}>
      <Generator />
    </Router>,
  );

  return history;
};

it('allows selecting a language', () => {
  renderGenerator();

  const selector = screen.getByRole('combobox');
  userEvent.selectOptions(selector, screen.getByRole('option', { name: 'English-Default' }));

  expect((selector as HTMLSelectElement).value).toBe('eng');
});

it('allows typing an input', () => {
  renderGenerator();

  const textbox = screen.getByRole('textbox');
  userEvent.type(textbox, input);

  expect((textbox as HTMLSelectElement).value).toBe(input);
});

describe('URL state management', () => {
  it('persists language and input', () => {
    const history = renderGenerator();

    const textbox = screen.getByRole('textbox');
    userEvent.type(textbox, input);

    expect(history.location.search).toBe(`?gLang=eng&gQ=${input}`);
  });

  it('restores language and input', () => {
    renderGenerator({ initialEntries: [`/?gLang=spa&gQ=${input}`] });

    const textbox = screen.getByRole('textbox');
    expect((textbox as HTMLSelectElement).value).toBe(input);

    const selector = screen.getByRole('combobox');
    expect((selector as HTMLSelectElement).value).toBe('spa');
  });

  it('restores iso-639-1 language', () => {
    renderGenerator({ initialEntries: [`/?gLang=es`] });

    const selector = screen.getByRole('combobox');
    expect((selector as HTMLSelectElement).value).toBe('spa');
  });

  it('discards invalid language', () => {
    renderGenerator({ initialEntries: [`/?gLang=foo`] });

    const selector = screen.getByRole('combobox');
    expect((selector as HTMLSelectElement).value).toBe('eng');
  });

  it('discards long input', () => {
    const history = renderGenerator();

    const input = 'foobar'.repeat(500);

    const textbox = screen.getByRole('textbox') as HTMLTextAreaElement;
    userEvent.paste(textbox, input);

    expect(history.location.search).toBe(`?gLang=eng`);
  });
});

describe('browser storage management', () => {
  it('persists language and input', () => {
    {
      renderGenerator();

      const textbox = screen.getByRole('textbox');
      userEvent.type(textbox, input);

      cleanup();
    }

    renderGenerator();

    const textbox = screen.getByRole('textbox');
    expect((textbox as HTMLSelectElement).value).toBe(input);
  });

  it('prefers URL parameters', () => {
    {
      renderGenerator();

      const textbox = screen.getByRole('textbox');
      userEvent.type(textbox, 'qux');

      cleanup();
    }

    renderGenerator({ initialEntries: [`/?gLang=spa&gQ=${input}`] });

    const textbox = screen.getByRole('textbox');
    expect((textbox as HTMLSelectElement).value).toBe(input);

    const selector = screen.getByRole('combobox');
    expect((selector as HTMLSelectElement).value).toBe('spa');
  });
});
