import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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

function makeGithubDb(overrides: Record<string, unknown> = {}) {
  return {
    getTableRows: jest.fn().mockResolvedValue({
      content: [{ userId: 'u1', name: 'Alice' }],
      sha: 'table-sha',
    }),
    getRecordFileContentAndSha: jest.fn().mockResolvedValue({
      content: { userId: 'u1', name: 'Alice' },
      sha: 'record-sha',
    }),
    updateTableFile: jest.fn().mockResolvedValue({ commit }),
    updateRecordFile: jest.fn().mockResolvedValue({ commit }),
    deleteRecordFile: jest.fn().mockResolvedValue({ commit }),
    ...overrides,
  };
}

function renderPage({
  appModes = [] as string[],
  githubDb = makeGithubDb(),
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
    githubDb,
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
    </MemoryRouter>
  );
  return { githubDb };
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
    const { githubDb } = renderPage();

    await waitFor(() => {
      expect(githubDb.getTableRows).toHaveBeenCalledWith('iam', 'users');
    });
    expect(githubDb.getRecordFileContentAndSha).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(fieldInput(0)).toHaveValue('u1');
    });
    expect(fieldInput(1)).toHaveValue('Alice');
  });

  it('loads a single record file in split-table mode', async () => {
    const { githubDb } = renderPage({ appModes: ['split-table'] });

    await waitFor(() => {
      expect(githubDb.getRecordFileContentAndSha).toHaveBeenCalledWith(
        'iam',
        'users',
        'u1'
      );
    });
    expect(githubDb.getTableRows).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(fieldInput(0)).toHaveValue('u1');
    });
  });

  it('writes the whole table file when not in split-table mode', async () => {
    const { githubDb } = renderPage();
    await waitFor(() => {
      expect(githubDb.getTableRows).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(fieldInput(1)).toHaveValue('Alice');
    });

    fireEvent.change(fieldInput(1), { target: { value: 'Alice2' } });
    fireEvent.click(saveButton());

    await waitFor(() => {
      expect(githubDb.updateTableFile).toHaveBeenCalled();
    });
    const [dbName, tableName, newRows, sha] =
      githubDb.updateTableFile.mock.calls[0];
    expect([dbName, tableName, sha]).toEqual(['iam', 'users', 'table-sha']);
    expect(newRows).toHaveLength(1);
    expect(newRows[0]).toMatchObject({ userId: 'u1', name: 'Alice2' });
    expect(newRows[0].updatedAt).toEqual(expect.any(String));
    expect(githubDb.updateRecordFile).not.toHaveBeenCalled();

    expect(await screen.findByText('Record saved.')).toBeInTheDocument();
  });

  it('writes a single record file in split-table mode', async () => {
    const { githubDb } = renderPage({ appModes: ['split-table'] });
    await waitFor(() => {
      expect(githubDb.getRecordFileContentAndSha).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(fieldInput(1)).toHaveValue('Alice');
    });

    fireEvent.change(fieldInput(1), { target: { value: 'Alice2' } });
    fireEvent.click(saveButton());

    await waitFor(() => {
      expect(githubDb.updateRecordFile).toHaveBeenCalled();
    });
    const [dbName, tableName, primaryKey, record, recordFileSha] =
      githubDb.updateRecordFile.mock.calls[0];
    expect([dbName, tableName, primaryKey, recordFileSha]).toEqual([
      'iam',
      'users',
      'userId',
      'record-sha',
    ]);
    expect(record).toMatchObject({ userId: 'u1', name: 'Alice2' });
    expect(record.updatedAt).toEqual(expect.any(String));
    expect(githubDb.updateTableFile).not.toHaveBeenCalled();
  });

  it('deletes the record file after confirming, in split-table mode', async () => {
    const { githubDb } = renderPage({ appModes: ['split-table'] });
    await waitFor(() => {
      expect(githubDb.getRecordFileContentAndSha).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(saveButton()).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(await screen.findByText('Yes'));

    await waitFor(() => {
      expect(githubDb.deleteRecordFile).toHaveBeenCalledWith(
        'iam',
        'users',
        'u1',
        'record-sha'
      );
    });
    expect(await screen.findByText('Record deleted.')).toBeInTheDocument();
  });

  it('explains that delete is unsupported outside split-table mode', async () => {
    const { githubDb } = renderPage();
    await waitFor(() => {
      expect(githubDb.getTableRows).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(saveButton()).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(await screen.findByText('Yes'));

    expect(
      await screen.findByText('Only supported in split-table mode!')
    ).toBeInTheDocument();
    expect(githubDb.deleteRecordFile).not.toHaveBeenCalled();
  });

  it('renders no form when the URL id is not in the table file', async () => {
    const { githubDb } = renderPage({
      url: '/iam/users/update?userId=missing',
    });
    await waitFor(() => {
      expect(githubDb.getTableRows).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  it('finds and updates a record whose primary key is a number in the data file', async () => {
    const { githubDb } = renderPage({
      url: '/iam/users/update?userId=1',
      githubDb: makeGithubDb({
        getTableRows: jest.fn().mockResolvedValue({
          content: [{ userId: 1, name: 'Alice' }],
          sha: 'table-sha',
        }),
      }),
    });
    await waitFor(() => {
      expect(githubDb.getTableRows).toHaveBeenCalled();
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
      expect(githubDb.updateTableFile).toHaveBeenCalled();
    });
    const [, , newRows] = githubDb.updateTableFile.mock.calls[0];
    // The row is replaced, not appended a second time.
    expect(newRows).toHaveLength(1);
    expect(newRows[0]).toMatchObject({ name: 'Alice2' });
  });

  it('overrides form values from the __replace_fields__ query param', async () => {
    renderPage({
      url: `/iam/users/update?userId=u1&__replace_fields__=${encodeURIComponent(
        JSON.stringify({ name: 'Overridden' })
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
    const githubDb = makeGithubDb({
      getRecordFileContentAndSha: jest
        .fn()
        .mockRejectedValue(new Error('gone')),
    });
    renderPage({ appModes: ['split-table'], githubDb });

    expect(
      await screen.findByText(/Failed to get file from server!/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Reason: gone/)).toBeInTheDocument();
  });

  it('shows the error when saving the record file fails', async () => {
    const githubDb = makeGithubDb({
      updateRecordFile: jest.fn().mockRejectedValue(new Error('conflict')),
    });
    renderPage({ appModes: ['split-table'], githubDb });
    await waitFor(() => {
      expect(fieldInput(0)).toHaveValue('u1');
    });

    fireEvent.click(saveButton());

    expect(
      await screen.findByText(/Failed to update record file on server!/)
    ).toBeInTheDocument();
  });
});
