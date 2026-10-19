import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import UpdatePage from './index';
import PageContext from '../../../contexts/page';
import { AppContext } from '../../../contexts/AppContext';
import DbColumn from '../../../types/DbColumn';

const columns = [
  { id: 'userId', name: 'User ID', type: 'STRING', primary: true },
  { id: 'name', name: 'Name', type: 'STRING' },
] as unknown as DbColumn[];

const commit = { html_url: 'https://github.com/db-man/db.test/commit/9' };

function makeGithubDbV2(overrides: Record<string, unknown> = {}) {
  return {
    getTableRows: jest.fn().mockResolvedValue({
      content: [{ userId: 'u1', name: 'Alice' }],
      sha: 'table-sha',
    }),
    getRow: jest.fn().mockResolvedValue({
      content: { userId: 'u1', name: 'Alice' },
      sha: 'record-sha',
    }),
    updateTableFile: jest.fn().mockResolvedValue({ commit }),
    updateRow: jest.fn().mockResolvedValue({ commit }),
    deleteRow: jest.fn().mockResolvedValue({ commit }),
    ...overrides,
  };
}

function renderPage({
  appModes = [] as string[],
  githubDbV2 = makeGithubDbV2(),
  url = '/iam/users/update?userId=u1',
} = {}) {
  window.history.replaceState({}, '', url);
  const pageCtx = {
    appModes,
    dbName: 'iam',
    tableName: 'users',
    action: 'update',
    columns,
    primaryKey: 'userId',
    tables: [],
    githubDbV2,
  };
  render(
    <MemoryRouter>
      <AppContext.Provider
        value={{
          dbs: {},
          getTablesByDbName: () => [],
          getViewsByDbName: () => [],
          getViewByDbNameViewName: () => null,
        }}
      >
        <PageContext.Provider value={pageCtx as any}>
          <UpdatePage />
        </PageContext.Provider>
      </AppContext.Provider>
    </MemoryRouter>,
  );
  return { githubDbV2 };
}

function fieldInput(index: number) {
  const field = document.querySelectorAll('.dbm-form-field')[index];
  return within(field as HTMLElement).getByRole('textbox') as HTMLInputElement;
}

const saveButton = () => screen.getByRole('button', { name: 'Save' });

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('UpdatePage', () => {
  it('loads the whole table file and prefills the record when not in split-table mode', async () => {
    const { githubDbV2 } = renderPage();

    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalledWith('iam', 'users');
    });
    expect(githubDbV2.getRow).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(fieldInput(0)).toHaveValue('u1');
    });
    expect(fieldInput(1)).toHaveValue('Alice');
  });

  it('loads a single record file in split-table mode', async () => {
    const { githubDbV2 } = renderPage({ appModes: ['split-table'] });

    await waitFor(() => {
      expect(githubDbV2.getRow).toHaveBeenCalledWith('iam', 'users', 'u1');
    });
    expect(githubDbV2.getTableRows).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(fieldInput(0)).toHaveValue('u1');
    });
  });

  it('writes the whole table file when not in split-table mode', async () => {
    const { githubDbV2 } = renderPage();
    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(fieldInput(1)).toHaveValue('Alice');
    });

    fireEvent.change(fieldInput(1), { target: { value: 'Alice2' } });
    fireEvent.click(saveButton());

    await waitFor(() => {
      expect(githubDbV2.updateTableFile).toHaveBeenCalled();
    });
    const [dbName, tableName, newRows, sha] =
      githubDbV2.updateTableFile.mock.calls[0];
    expect([dbName, tableName, sha]).toEqual(['iam', 'users', 'table-sha']);
    expect(newRows).toHaveLength(1);
    expect(newRows[0]).toMatchObject({ userId: 'u1', name: 'Alice2' });
    expect(newRows[0].updatedAt).toEqual(expect.any(String));
    expect(githubDbV2.updateRow).not.toHaveBeenCalled();

    expect(await screen.findByText('Record saved.')).toBeInTheDocument();
  });

  it('writes a single record file in split-table mode', async () => {
    const { githubDbV2 } = renderPage({ appModes: ['split-table'] });
    await waitFor(() => {
      expect(githubDbV2.getRow).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(fieldInput(1)).toHaveValue('Alice');
    });

    fireEvent.change(fieldInput(1), { target: { value: 'Alice2' } });
    fireEvent.click(saveButton());

    await waitFor(() => {
      expect(githubDbV2.updateRow).toHaveBeenCalled();
    });
    const [dbName, tableName, primaryKey, record, recordFileSha] =
      githubDbV2.updateRow.mock.calls[0];
    expect([dbName, tableName, primaryKey, recordFileSha]).toEqual([
      'iam',
      'users',
      'userId',
      'record-sha',
    ]);
    expect(record).toMatchObject({ userId: 'u1', name: 'Alice2' });
    expect(record.updatedAt).toEqual(expect.any(String));
    expect(githubDbV2.updateTableFile).not.toHaveBeenCalled();
  });

  it('deletes the record file after confirming, in split-table mode', async () => {
    const { githubDbV2 } = renderPage({ appModes: ['split-table'] });
    await waitFor(() => {
      expect(githubDbV2.getRow).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(saveButton()).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(await screen.findByText('Yes'));

    await waitFor(() => {
      expect(githubDbV2.deleteRow).toHaveBeenCalledWith(
        'iam',
        'users',
        'u1',
        'record-sha',
      );
    });
    expect(await screen.findByText('Record deleted.')).toBeInTheDocument();
  });

  it('explains that delete is unsupported outside split-table mode', async () => {
    const { githubDbV2 } = renderPage();
    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(saveButton()).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(await screen.findByText('Yes'));

    expect(
      await screen.findByText('Only supported in split-table mode!'),
    ).toBeInTheDocument();
    expect(githubDbV2.deleteRow).not.toHaveBeenCalled();
  });

  it('renders no form when the URL id is not in the table file', async () => {
    const { githubDbV2 } = renderPage({
      url: '/iam/users/update?userId=missing',
    });
    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Save' }),
      ).not.toBeInTheDocument();
    });
  });

  it('finds and updates a record whose primary key is a number in the data file', async () => {
    const { githubDbV2 } = renderPage({
      url: '/iam/users/update?userId=1',
      githubDbV2: makeGithubDbV2({
        getTableRows: jest.fn().mockResolvedValue({
          content: [{ userId: 1, name: 'Alice' }],
          sha: 'table-sha',
        }),
      }),
    });
    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalled();
    });

    // Before, `row[primaryKey] === currentId()` was false (`1 !== '1'`), so the
    // form was never prefilled and no Save button was rendered at all.
    await waitFor(() => {
      expect(fieldInput(0)).toHaveValue('1');
    });
    expect(fieldInput(1)).toHaveValue('Alice');

    fireEvent.change(fieldInput(1), { target: { value: 'Alice2' } });
    fireEvent.click(saveButton());

    await waitFor(() => {
      expect(githubDbV2.updateTableFile).toHaveBeenCalled();
    });
    const [, , newRows] = githubDbV2.updateTableFile.mock.calls[0];
    // The row is replaced, not appended a second time.
    expect(newRows).toHaveLength(1);
    expect(newRows[0]).toMatchObject({ name: 'Alice2' });
  });

  it('overrides form values from the __replace_fields__ query param', async () => {
    renderPage({
      url: `/iam/users/update?userId=u1&__replace_fields__=${encodeURIComponent(
        JSON.stringify({ name: 'Overridden' }),
      )}`,
    });

    await waitFor(() => {
      expect(fieldInput(1)).toHaveValue('Overridden');
    });
  });

  it('ignores an unparsable __replace_fields__ param', async () => {
    renderPage({
      url: '/iam/users/update?userId=u1&__replace_fields__=not-json',
    });

    await waitFor(() => {
      expect(fieldInput(1)).toHaveValue('Alice');
    });
  });

  it('shows the error when the record file cannot be loaded', async () => {
    const githubDbV2 = makeGithubDbV2({
      getRow: jest.fn().mockRejectedValue(new Error('gone')),
    });
    renderPage({ appModes: ['split-table'], githubDbV2 });

    expect(
      await screen.findByText(/Failed to get file from server!/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reason: gone/)).toBeInTheDocument();
  });

  it('shows the error when saving the record file fails', async () => {
    const githubDbV2 = makeGithubDbV2({
      updateRow: jest.fn().mockRejectedValue(new Error('conflict')),
    });
    renderPage({ appModes: ['split-table'], githubDbV2 });
    await waitFor(() => {
      expect(fieldInput(0)).toHaveValue('u1');
    });

    fireEvent.click(saveButton());

    expect(
      await screen.findByText(/Failed to update record file on server!/),
    ).toBeInTheDocument();
  });
});
