import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { message } from 'antd';

import CreatePage from './CreatePage';
import PageContext from '../../contexts/page';
import { AppContext } from '../../contexts/AppContext';
import DbColumn from '../../types/DbColumn';

const columns = [
  { id: 'userId', name: 'User ID', type: 'STRING', primary: true },
  { id: 'name', name: 'Name', type: 'STRING' },
  { id: 'tags', name: 'Tags', type: 'STRING_ARRAY' },
] as unknown as DbColumn[];

const commit = { html_url: 'https://github.com/db-man/db.test/commit/1' };

/**
 * `GithubDb` reaches the page through `PageContext`, so a plain stub object is
 * enough — the module itself does not need mocking here.
 */
function makeGithubDbV2(overrides: Record<string, unknown> = {}) {
  return {
    getTableRows: jest.fn().mockResolvedValue({ content: [], sha: 'sha-1' }),
    updateTableFile: jest.fn().mockResolvedValue({ commit }),
    updateRecordFile: jest.fn().mockResolvedValue({ commit }),
    getDataUrl: () =>
      'https://github.com/db-man/db.test/blob/main/dbs/iam/users.data.json',
    ...overrides,
  };
}

function renderPage({
  appModes = [] as string[],
  githubDbV2 = makeGithubDbV2(),
} = {}) {
  const pageCtx = {
    appModes,
    dbName: 'iam',
    tableName: 'users',
    action: 'create',
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
          <CreatePage />
        </PageContext.Provider>
      </AppContext.Provider>
    </MemoryRouter>,
  );
  return { githubDbV2 };
}

/** The form renders one `.dbm-form-field` per column, in schema order. */
function fieldInput(index: number) {
  const field = document.querySelectorAll('.dbm-form-field')[index];
  return within(field as HTMLElement).getByRole('textbox') as HTMLInputElement;
}

const saveButton = () => screen.getByRole('button', { name: 'Save' });

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('CreatePage', () => {
  it('loads the whole table file on mount when not in split-table mode', async () => {
    const { githubDbV2 } = renderPage();
    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalledWith('iam', 'users');
    });
    expect(githubDbV2.getTableRows).toHaveBeenCalledTimes(1);
  });

  it('does not load the whole table file in split-table mode', async () => {
    const { githubDbV2 } = renderPage({ appModes: ['split-table'] });
    // Rendering the form proves the mount effect has run.
    await waitFor(() => {
      expect(saveButton()).toBeInTheDocument();
    });
    expect(githubDbV2.getTableRows).not.toHaveBeenCalled();
  });

  it('appends the new record to the table file when not in split-table mode', async () => {
    const { githubDbV2 } = renderPage();
    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalled();
    });

    fireEvent.change(fieldInput(0), { target: { value: 'u1' } });
    fireEvent.change(fieldInput(1), { target: { value: 'Alice' } });
    fireEvent.click(saveButton());

    await waitFor(() => {
      expect(githubDbV2.updateTableFile).toHaveBeenCalled();
    });
    const [dbName, tableName, content, sha] =
      githubDbV2.updateTableFile.mock.calls[0];
    expect([dbName, tableName, sha]).toEqual(['iam', 'users', 'sha-1']);
    expect(content).toHaveLength(1);
    expect(content[0]).toMatchObject({ userId: 'u1', name: 'Alice' });
    expect(content[0].createdAt).toEqual(expect.any(String));
    expect(content[0].updatedAt).toEqual(content[0].createdAt);

    expect(await screen.findByText('Record saved.')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Commit link').closest('a')).toHaveAttribute(
      'href',
      commit.html_url,
    );
  });

  it('creates a record file when in split-table mode', async () => {
    const { githubDbV2 } = renderPage({ appModes: ['split-table'] });
    await waitFor(() => {
      expect(saveButton()).toBeInTheDocument();
    });

    fireEvent.change(fieldInput(0), { target: { value: 'u1' } });
    fireEvent.click(saveButton());

    await waitFor(() => {
      expect(githubDbV2.updateRecordFile).toHaveBeenCalled();
    });
    const [dbName, tableName, primaryKey, record, recordFileSha] =
      githubDbV2.updateRecordFile.mock.calls[0];
    expect([dbName, tableName, primaryKey]).toEqual(['iam', 'users', 'userId']);
    expect(record).toMatchObject({ userId: 'u1' });
    expect(recordFileSha).toBeNull();
    expect(githubDbV2.updateTableFile).not.toHaveBeenCalled();
  });

  it('blocks the save and warns when the primary key already exists', async () => {
    const warnSpy = jest
      .spyOn(message, 'warning')
      .mockImplementation(() => undefined as any);
    const githubDbV2 = makeGithubDbV2({
      getTableRows: jest
        .fn()
        .mockResolvedValue({ content: [{ userId: 'u1' }], sha: 'sha-1' }),
    });
    renderPage({ githubDbV2 });
    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalled();
    });

    fireEvent.change(fieldInput(0), { target: { value: 'u1' } });
    fireEvent.click(saveButton());

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalled();
    });
    expect(githubDbV2.updateTableFile).not.toHaveBeenCalled();
  });

  it('shows the error when the table file cannot be loaded', async () => {
    const githubDbV2 = makeGithubDbV2({
      getTableRows: jest.fn().mockRejectedValue(new Error('offline')),
    });
    renderPage({ githubDbV2 });

    expect(
      await screen.findByText(/Failed to get table file from server!/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reason: offline/)).toBeInTheDocument();
  });

  it('shows the error when saving the table file fails', async () => {
    const githubDbV2 = makeGithubDbV2({
      updateTableFile: jest.fn().mockRejectedValue(new Error('conflict')),
    });
    renderPage({ githubDbV2 });
    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalled();
    });

    fireEvent.change(fieldInput(0), { target: { value: 'u1' } });
    fireEvent.click(saveButton());

    expect(
      await screen.findByText(/Failed to update table file on server!/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reason: conflict/)).toBeInTheDocument();
  });

  it('prefills the form from the URL query params, wrapping STRING_ARRAY values', async () => {
    window.history.replaceState(
      {},
      '',
      '/iam/users/create?userId=from-url&tags=vip',
    );
    const { githubDbV2 } = renderPage();
    await waitFor(() => {
      expect(githubDbV2.getTableRows).toHaveBeenCalled();
    });

    expect(fieldInput(0)).toHaveValue('from-url');

    fireEvent.click(saveButton());
    await waitFor(() => {
      expect(githubDbV2.updateTableFile).toHaveBeenCalled();
    });
    // A STRING_ARRAY column keeps its array shape, a STRING column keeps a string
    expect(githubDbV2.updateTableFile.mock.calls[0][2][0]).toMatchObject({
      userId: 'from-url',
      tags: ['vip'],
    });
  });
});
