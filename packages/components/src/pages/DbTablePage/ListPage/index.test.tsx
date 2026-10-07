import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GithubDb } from '@db-man/github';

import { STRING } from '../../../constants';
import PageContext, { PageContextType } from '../../../contexts/page';
import DbColumn from '../../../types/DbColumn';
import ListPage from './index';

/**
 * IMPORTANT: never configure a mock at module scope in this repo.
 * CRA sets `resetMocks: true`, which wipes every mock implementation before
 * each test. The implementation must be set inside the test (or `beforeEach`).
 */
const mockGetTableRows = jest.fn();

const columns: DbColumn[] = [
  { id: 'userId', name: 'User ID', type: STRING, primary: true },
  { id: 'name', name: 'Name', type: STRING, 'ui:listPage:isFilter': true },
];

const context = {
  appModes: [],
  dbs: {},
  dbName: 'iam',
  tableName: 'users',
  action: 'list',
  columns,
  primaryKey: 'userId',
  tables: [],
  githubDb: { getTableRows: mockGetTableRows } as unknown as GithubDb,
} as PageContextType;

const renderListPage = () =>
  render(
    <BrowserRouter>
      <PageContext.Provider value={context}>
        <ListPage tableName='users' />
      </PageContext.Provider>
    </BrowserRouter>
  );

const row = (userId: string, name: string) => ({
  userId,
  name,
  createdAt: '2021-07-04 09:16:01',
  updatedAt: '2021-07-04 09:16:01',
});

describe('ListPage', () => {
  beforeEach(() => {
    mockGetTableRows.mockReset();
  });

  it('shows a loading tip, then renders the rows returned by githubDb', async () => {
    let resolveGetTableRows: (value: unknown) => void = () => {};
    mockGetTableRows.mockReturnValue(
      new Promise((resolve) => {
        resolveGetTableRows = resolve;
      })
    );

    renderListPage();

    // While the request is in flight, the loading tip is shown
    expect(screen.getByText(/Loading iam\/users/i)).toBeInTheDocument();

    resolveGetTableRows({ content: [row('123', 'David')] });

    expect(await screen.findByText('David')).toBeInTheDocument();
    expect(screen.queryByText(/Loading iam\/users/i)).not.toBeInTheDocument();
    expect(mockGetTableRows).toHaveBeenCalledWith(
      'iam',
      'users',
      expect.anything()
    );
  });

  it('renders an error alert when fetching the rows fails', async () => {
    mockGetTableRows.mockRejectedValue(new Error('boom'));

    renderListPage();

    expect(
      await screen.findByText(/Failed to get data: boom/i)
    ).toBeInTheDocument();
  });

  it('warns about rows sharing the same primary key', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [row('123', 'David'), row('123', 'Ben')],
    });

    renderListPage();

    expect(
      await screen.findByText(/Duplicated row keys/i)
    ).toBeInTheDocument();
  });

  it('warns about rows which have no primary key', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [row('123', 'David'), { name: 'NoKey' }],
    });

    renderListPage();

    expect(await screen.findByText(/Invalid rows/i)).toBeInTheDocument();
  });

  it('filters the displayed rows by the filter input', async () => {
    mockGetTableRows.mockResolvedValue({
      content: [row('123', 'David'), row('456', 'Ben')],
    });

    renderListPage();
    expect(await screen.findByText('Ben')).toBeInTheDocument();

    // The first text box above the table is the "Name" filter
    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'Dav' },
    });

    await waitFor(() =>
      expect(screen.queryByText('Ben')).not.toBeInTheDocument()
    );
    expect(screen.getByText('David')).toBeInTheDocument();

    // Let the debounced `updateUrl` (500ms) flush inside this test, so that any
    // error it throws is reported here instead of leaking into the next test.
    await new Promise((resolve) => setTimeout(resolve, 600));
  });
});
