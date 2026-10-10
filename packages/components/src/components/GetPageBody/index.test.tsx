import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import GetPageBody from './index';
import PageContext from '../../contexts/page';
import { AppContext } from '../../contexts/AppContext';
import DbColumn from '../../types/DbColumn';

const columns = [
  { id: 'userId', name: 'User ID', type: 'STRING', primary: true },
  { id: 'name', name: 'Name', type: 'STRING' },
] as unknown as DbColumn[];

function renderDetail({
  rows,
  url = '/iam/users/get?userId=1',
}: {
  rows: Record<string, unknown>[];
  url?: string;
}) {
  window.history.replaceState({}, '', url);
  const githubDb = {
    getTableRows: jest.fn().mockResolvedValue({ content: rows, sha: 'sha' }),
  };
  const pageCtx = {
    appModes: [] as string[],
    dbName: 'iam',
    tableName: 'users',
    action: 'get',
    columns,
    tables: [],
    primaryKey: 'userId',
    githubDb,
  };

  render(
    <AppContext.Provider
      value={{
        dbs: {},
        getTablesByDbName: () => [],
        getViewsByDbName: () => [],
        getViewByDbNameViewName: () => null,
      }}
    >
      <PageContext.Provider value={pageCtx as any}>
        <GetPageBody />
      </PageContext.Provider>
    </AppContext.Provider>,
  );

  return { githubDb };
}

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('GetPageBody', () => {
  it('renders the record whose primary key is a number in the data file', async () => {
    // The URL query holds '1' while the data file holds the number 1.
    renderDetail({ rows: [{ userId: 1, name: 'Alice' }] });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });

  it('renders the record whose primary key is a string in the data file', async () => {
    renderDetail({
      rows: [{ userId: 'u1', name: 'Alice' }],
      url: '/iam/users/get?userId=u1',
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    });
  });

  it('reports an error when no row matches the URL id', async () => {
    renderDetail({
      rows: [{ userId: 1, name: 'Alice' }],
      url: '/iam/users/get?userId=9',
    });

    expect(await screen.findByText('item not found in db')).toBeInTheDocument();
  });

  it('reports an error when the URL holds no id at all', async () => {
    renderDetail({
      rows: [{ name: 'Alice' }],
      url: '/iam/users/get',
    });

    expect(await screen.findByText('item not found in db')).toBeInTheDocument();
  });
});
