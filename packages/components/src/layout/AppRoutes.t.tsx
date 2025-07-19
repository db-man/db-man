/* istanbul ignore file */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AppRoutes from './AppRoutes';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

it.skip('navigates settings page', () => {
  render(
    <MemoryRouter initialEntries={['/settings']}>
      <AppRoutes />
    </MemoryRouter>
  );
  const linkElement = screen.getByText(/Settings/i);
  expect(linkElement).toBeInTheDocument();
});

it.skip('navigates db page', () => {
  /* const { asFragment } = */ render(
    <MemoryRouter initialEntries={['/foo']}>
      <AppRoutes />
    </MemoryRouter>
  );
  // const linkElement = screen.getByText(/List of tables in DB:/i);
  const linkElement = screen.getByText(/Failed to get dbs from localStorage/i);

  expect(linkElement).toBeInTheDocument();
  // expect(asFragment()).toMatchSnapshot();
});
