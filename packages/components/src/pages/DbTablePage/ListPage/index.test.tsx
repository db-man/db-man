import React, { act } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render /* screen,  waitFor, */ } from '@testing-library/react';

import { STRING } from '../../../constants';
import PageContext, { PageContextType } from '../../../contexts/page';
import ListPageBody from './index';

const context: PageContextType = {
  dbName: 'db-man',
  tableName: 'users',
  action: 'list',
  columns: [
    { id: 'id', name: 'ID', type: STRING },
    { id: 'email', name: 'Email', type: STRING },
  ],
  primaryKey: 'id',
  tables: [],
  githubDb: {
    getTableRows: jest.fn(),
    getTableInsights: jest.fn(),
    updateTableFile: jest.fn(),
    updateRecordFile: jest.fn(),
    createDatabase: jest.fn(),
    getDataUrl: jest.fn(),
    getRecordFileContentAndSha: jest.fn(),
    getGitHubRepoPath: jest.fn(),
    getGitHubFullPath: jest.fn(),
    getDataPath: jest.fn(),
    deleteRecordFile: jest.fn(),
  },
  appModes: [],
  dbs: {},
};
// jest.mock('@db-man/github');

beforeEach(() => {
  (context.githubDb?.getTableRows as any).mockReset();
  (context.githubDb?.getTableRows as any).mockResolvedValue({
    content: [{ userId: '123' }],
  });
});

afterEach(() => {});

describe.skip('ListPageBody', () => {
  it('renders table properly', async () => {
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

    // githubDb.getTableRows.mockResolvedValue({ content: [{ id: '123', email: 'foo@abc.com' }] });

    act(() => {
      render(
        <BrowserRouter>
          <PageContext.Provider value={context}>
            <ListPageBody tableName="users" />
          </PageContext.Provider>
        </BrowserRouter>
      );
    });

    // await screen.findByText('Loading db-man/users ...');

    // await waitFor(() => expect(githubDb.getTableRows).toHaveBeenCalledTimes(1));

    // await screen.findByText('123');
    // await screen.findByText('foo');

    // screen.debug();

    // expect(
    //   container.innerHTML,
    // ).toMatchSnapshot(); /* ... gets filled automatically by jest ... */
  });
});
