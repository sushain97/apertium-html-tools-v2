import * as React from 'react';
import { MemoryHistory, MemoryHistoryBuildOptions, createMemoryHistory } from 'history';
import { getAllByRole, render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import Navbar from '.';

const renderNavbar = (options?: MemoryHistoryBuildOptions): MemoryHistory => {
  const history = createMemoryHistory(options);
  const setLocale = jest.fn();

  render(
    <Router history={history}>
      <Navbar setLocale={setLocale} />
    </Router>,
  );

  return history;
};

it('renders navigation options', () => {
  renderNavbar();

  const navbar = screen.getByRole('navigation');
  const buttons = getAllByRole(navbar, 'button', { name: (n) => n !== 'Toggle navigation' });

  expect(buttons).toHaveLength(4);
});

it('defaults to translation', () => {
  renderNavbar();

  expect(screen.getByText('Translation-Default').className).toContain('active');
});

describe('translation navigation', () => {
  it.each(['/translation', '/webpageTranslation', '/docTranslation'])('shows active link for %s', (pathname) => {
    renderNavbar({ initialEntries: [pathname] });
    expect(screen.getByText('Translation-Default').className).toContain('active');
  });

  it('navigates on button click', () => {
    const history = renderNavbar();
    userEvent.click(screen.getByText('Translation-Default'));
    expect(history.location.pathname).toEqual('/translation');
  });
});

describe('analysis navigation', () => {
  it('shows an active link', () => {
    renderNavbar({ initialEntries: ['/analysis'] });
    expect(screen.getByText('Morphological_Analysis-Default').className).toContain('active');
  });

  it('navigates on button click', () => {
    const history = renderNavbar();
    userEvent.click(screen.getByText('Morphological_Analysis-Default'));
    expect(history.location.pathname).toEqual('/analysis');
  });
});

describe('generation navigation', () => {
  it('shows an active link', () => {
    renderNavbar({ initialEntries: ['/generation'] });
    expect(screen.getByText('Morphological_Generation-Default').className).toContain('active');
  });

  it('navigates on button click', () => {
    const history = renderNavbar();
    userEvent.click(screen.getByText('Morphological_Generation-Default'));
    expect(history.location.pathname).toEqual('/generation');
  });
});

describe('sandbox navigation', () => {
  it('shows an active link', () => {
    renderNavbar({ initialEntries: ['/sandbox'] });
    expect(screen.getByText('APy_Sandbox-Default').className).toContain('active');
  });

  it('navigates on button click', () => {
    const history = renderNavbar();
    userEvent.click(screen.getByText('APy_Sandbox-Default'));
    expect(history.location.pathname).toEqual('/sandbox');
  });
});
