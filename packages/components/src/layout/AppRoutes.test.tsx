import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { types } from '@db-man/github';

import AppRoutes from './AppRoutes';
import { AppContext, AppContextProps } from '../contexts/AppContext';

// `PageLayout` calls `useAppContext()`, which throws when there is no provider.
// That is why rendering `<AppRoutes />` on its own used to fail, and why this
// test file was disabled. Always wrap it in `AppContext.Provider`.
const dbs: types.DatabaseMap = {
  iam: {
    name: 'iam',
    description: 'Identity and access management',
    tables: [
      {
        name: 'users',
        columns: [
          { id: 'userId', name: 'User ID', type: 'STRING', primary: true },
        ],
      },
    ],
  },
};

const appContextValue: AppContextProps = {
  dbs,
  getTablesByDbName: (dbName: string) => dbs[dbName]?.tables || [],
  getViewsByDbName: (dbName: string) => dbs[dbName]?.views || [],
  getViewByDbNameViewName: (dbName: string, viewName: string) =>
    dbs[dbName]?.views?.find(({ name }) => name === viewName) || null,
};

const renderAt = (path: string) =>
  render(
    <AppContext.Provider value={appContextValue}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppContext.Provider>
  );

describe('AppRoutes', () => {
  it('renders the Settings page for "/settings"', () => {
    renderAt('/settings');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Settings' })
    ).toBeInTheDocument();
  });

  it('renders "db not found" when the db has no schema', () => {
    renderAt('/foo');

    expect(screen.getByText(/db not found/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Go to Settings' })
    ).toBeInTheDocument();
  });

  it('lists the tables of the db when the route only has a dbName', () => {
    renderAt('/iam');

    expect(screen.getByText(/List of tables in DB/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'users' })).toBeInTheDocument();
  });
});
