import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import {
  render, act, screen, waitFor,
} from '@testing-library/react';
import { githubDb } from '@db-man/github';

import ListPageBody from './index';
import PageContext from '../../contexts/page';

const context = {
  dbName: 'db-man',
  tableName: 'users',
  action: 'list',
  columns: [{ id: 'id', name: 'ID' }, { id: 'email', name: 'Email' }],
  primaryKey: 'id',
  tables: [],
};
jest.mock('@db-man/github');

beforeEach(() => {
  githubDb.getTableRows.mockReset();
});

afterEach(() => {

});

describe('ListPageBody', () => {
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

    githubDb.getTableRows.mockResolvedValue({ content: [{ id: '123', email: 'foo@abc.com' }] });

    act(() => {
      render(
        <BrowserRouter>
          <PageContext.Provider value={context}>
            <ListPageBody tableName="users" />
          </PageContext.Provider>
        </BrowserRouter>,
      );
    });

    await screen.findByText('Loading db-man/users ...');

    await waitFor(() => expect(githubDb.getTableRows).toHaveBeenCalledTimes(1));

    await screen.findByText('123');
    // await screen.findByText('foo');

    // screen.debug();

    // expect(
    //   container.innerHTML,
    // ).toMatchSnapshot(); /* ... gets filled automatically by jest ... */
  });
});
