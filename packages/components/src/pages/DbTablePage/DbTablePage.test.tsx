import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';

import { LS_KEY_DBS_SCHEMA } from '../../constants';
import DbTablePage from './DbTablePage';

/**
 * `DbTablePage` builds its own `GithubDb` (`useRef(new GithubDb({...}))`), so
 * the module has to be mocked — it cannot be injected through a context.
 *
 * The replacement MUST be a plain class, not `jest.fn()`: CRA sets
 * `resetMocks: true`, and a module-scope `jest.fn()` constructor would be reset
 * before each test and return `undefined`, breaking the component at render
 * time. The `mock*` name prefix is required by jest for variables referenced
 * inside a `jest.mock` factory.
 */
const mockGetDbTablesSchemaAsync = jest.fn();
const mockGetTableRows = jest.fn();

jest.mock('@db-man/github', () => {
  const actual = jest.requireActual('@db-man/github') as Record<
    string,
    unknown
  >;
  return {
    ...actual,
    GithubDb: class GithubDbMock {
      getDbTablesSchemaAsync = mockGetDbTablesSchemaAsync;
      getTableRows = mockGetTableRows;
      // NavBar renders GitHub links while the page shell renders. These are not
      // asserted on, but they must exist or the shell throws.
      getDataUrl = () =>
        'https://github.com/db-man/db.test/blob/main/dbs/iam/users.data.json';
      getDataPath = () => 'dbs/iam/users.data.json';
    },
  };
});

/**
 * The db schema stored in localStorage uses `tables` as an array of
 * `{ name, columns }`. `src/dbs.ts::getTablesByDbName` reads
 * `dbs[dbName].tables`, so the older "array of tables" fixture shape used by
 * the previously disabled test would silently yield no columns.
 */
const dbsSchema = {
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
      { name: 'empty', columns: [] },
    ],
  },
};

const renderPage = (props: {
  dbName: string;
  tableName?: string;
  action?: string;
}) =>
  render(
    <BrowserRouter>
      <DbTablePage {...props} />
    </BrowserRouter>
  );

describe('DbTablePage', () => {
  beforeEach(() => {
    mockGetDbTablesSchemaAsync.mockReset();
    mockGetDbTablesSchemaAsync.mockResolvedValue(undefined);
    mockGetTableRows.mockReset();
    mockGetTableRows.mockResolvedValue({ content: [] });

    localStorage.setItem(LS_KEY_DBS_SCHEMA, JSON.stringify(dbsSchema));
  });

  it('renders an error when the table has no columns', () => {
    renderPage({ dbName: 'iam', tableName: 'empty', action: 'list' });

    expect(
      screen.getByText(/No columns found for this table/i)
    ).toBeInTheDocument();
  });

  it('renders an error when the table is not in the schema', () => {
    renderPage({ dbName: 'iam', tableName: 'nope', action: 'list' });

    expect(
      screen.getByText(/No columns found for this table/i)
    ).toBeInTheDocument();
  });

  it('renders 404 when the action maps to no page component', () => {
    renderPage({ dbName: 'iam', tableName: 'users', action: 'no-such-action' });

    expect(
      screen.getByText(/404 - PageComponent Not Found/i)
    ).toBeInTheDocument();
    expect(screen.getByText('/iam/users/no-such-action')).toBeInTheDocument();
  });

  it('renders the page component for a known action', async () => {
    renderPage({ dbName: 'iam', tableName: 'users', action: 'list' });

    expect(screen.getByText('list iam/users')).toBeInTheDocument();
    // The ListPage child mounted and fetched its rows through the PageContext
    await waitFor(() =>
      expect(mockGetTableRows).toHaveBeenCalledWith(
        'iam',
        'users',
        expect.anything()
      )
    );
  });

  it('warns when the offline and online db schemas differ', async () => {
    mockGetDbTablesSchemaAsync.mockResolvedValue({
      name: 'iam',
      description: 'Changed on GitHub',
      tables: [],
    });

    renderPage({ dbName: 'iam', tableName: 'users', action: 'list' });

    expect(
      await screen.findByText(
        /Offline and online schema are different/i,
        {},
        { timeout: 3000 }
      )
    ).toBeInTheDocument();
  });
});
