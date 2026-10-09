import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SchemaPage from './SchemaPage';
import PageContext from '../../contexts/page';
import {
  LS_KEY_GITHUB_OWNER,
  LS_KEY_GITHUB_REPO_NAME,
  LS_KEY_GITHUB_REPO_PATH,
} from '../../constants';

const columns = [
  { id: 'userId', name: 'User ID', type: 'STRING', primary: true },
  { id: 'tags', name: 'Tags', type: 'STRING_ARRAY' },
  { id: 'refId', name: 'Ref', type: 'STRING', referenceTable: 'users' },
  {
    id: 'role',
    name: 'Role',
    type: 'STRING',
    'type:createUpdatePage': 'RadioGroup',
    'ui:createUpdatePage:enum': ['admin', 'user'],
    'ui:createUpdatePage:selectOptions': [{ label: 'A', value: 'a' }],
    'ui:listPage:isFilter': true,
    'ui:listPage:isImageViewKey': true,
    'ui:listPage:randomView': [['ImageLink', '{"url":"x"}']],
  },
  { id: 'plain', name: 'Plain', type: 'STRING' },
] as any[];

function renderPage({
  dbTableColumns = columns,
  url = '/iam/users/schema',
  githubDb = {
    getTableRows: jest.fn().mockResolvedValue({ content: [{ tags: ['a'] }] }),
  },
}: {
  dbTableColumns?: any[];
  url?: string;
  githubDb?: any;
} = {}) {
  const pageCtx = {
    appModes: [],
    dbName: 'iam',
    tableName: 'users',
    action: 'schema',
    columns: dbTableColumns,
    primaryKey: 'userId',
    tables: [],
    githubDb,
  };
  render(
    <MemoryRouter initialEntries={[url]}>
      <PageContext.Provider value={pageCtx as any}>
        <SchemaPage />
      </PageContext.Provider>
    </MemoryRouter>
  );
  return { githubDb };
}

const tableHeadText = () =>
  (document.querySelector('.ant-table-thead') as HTMLElement).textContent || '';

/**
 * antd's Table inserts a hidden `ant-table-measure-row` as the first `<tr>`,
 * so `tbody tr` is off by one. Only real rows carry `ant-table-row`.
 */
const bodyRows = () =>
  Array.from(document.querySelectorAll('tr.ant-table-row')) as HTMLElement[];

describe('SchemaPage', () => {
  it('renders a row per column in the schema table', () => {
    renderPage();
    expect(screen.getByText('Table Schema:')).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(columns.length);
    expect(tableHeadText()).toContain('primary');
    expect(tableHeadText()).toContain('referenceTable');
  });

  it('renders Yes for the primary column and No for others', () => {
    renderPage();
    expect(bodyRows()[0].textContent).toContain('Yes');
    expect(bodyRows()[4].textContent).toContain('No');
  });

  it('links STRING_ARRAY column ids to the distinct view', () => {
    renderPage();
    const link = within(bodyRows()[1]).getByRole('link', { name: 'tags' });
    expect(link).toHaveAttribute('href', '/iam/users/schema?distinct=tags');
  });

  it('renders a plain text id for non STRING_ARRAY columns', () => {
    renderPage();
    expect(
      within(bodyRows()[0]).queryByRole('link', { name: 'userId' })
    ).not.toBeInTheDocument();
    expect(bodyRows()[0].textContent).toContain('userId');
  });

  it('links the reference table name', () => {
    renderPage();
    const link = within(bodyRows()[2]).getByRole('link', { name: 'users' });
    expect(link).toHaveAttribute('href', '/iam/users/list');
  });

  it('renders None for empty enum and select options, and joins non-empty ones', () => {
    renderPage();
    expect(bodyRows()[0].textContent).toContain('None');
    expect(bodyRows()[3].textContent).toContain('admin, user');
  });

  it('renders a demo button only when a UI type is configured', () => {
    renderPage();
    // Only the "role" column sets `type:createUpdatePage`
    expect(screen.getAllByRole('button', { name: 'demo' })).toHaveLength(1);
    expect(bodyRows()[3].textContent).toContain('RadioGroup');
  });

  it('renders booleans and objects in the list-page columns', () => {
    renderPage();
    const roleRow = bodyRows()[3];
    expect(roleRow.textContent).toContain('Yes'); // isFilter + isImageViewKey
    expect(roleRow.textContent).toContain('ImageLink');
  });

  it('shows the validation message when the table has no columns', () => {
    renderPage({ dbTableColumns: [] });
    expect(
      screen.getByText(/No columns defined in the table./)
    ).toBeInTheDocument();
  });

  it('shows the validation message for an unknown column key', () => {
    renderPage({
      dbTableColumns: [
        { id: 'userId', name: 'User ID', type: 'STRING', mysteryKey: 1 },
      ],
    });
    expect(
      screen.getByText(/Column userId: Invalid key: mysteryKey;/)
    ).toBeInTheDocument();
  });

  it('renders the footer links using the stored repo settings', () => {
    localStorage.setItem(LS_KEY_GITHUB_OWNER, 'db-man');
    localStorage.setItem(LS_KEY_GITHUB_REPO_NAME, 'db');
    localStorage.setItem(LS_KEY_GITHUB_REPO_PATH, 'dbs');
    renderPage();

    const footer = document.querySelector('.ant-table-footer') as HTMLElement;
    expect(within(footer).getByText('dbcfg.json').closest('a')).toHaveAttribute(
      'href',
      'https://github.com/db-man/db/blob/main/dbs/iam/dbcfg.json'
    );
    expect(within(footer).getByText('users').closest('a')).toHaveAttribute(
      'href',
      '/_management/iam/users'
    );
  });

  it('renders the JSON tab with the serialized columns', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('tab', { name: 'JSON' }));
    // `react-simple-code-editor` renders a contenteditable div, not a textarea
    const editor = document.querySelector(
      '.npm__react-simple-code-editor__textarea'
    );
    expect(editor?.textContent).toBe(JSON.stringify(columns, null, '  '));
  });

  it('renders DistinctColumn when the distinct query param is set', async () => {
    const { githubDb } = renderPage({ url: '/iam/users/schema?distinct=tags' });
    await waitFor(() => {
      expect(githubDb.getTableRows).toHaveBeenCalledWith('iam', 'users');
    });
    expect(
      document.querySelector('.dbm-distinct-column-component')
    ).toBeInTheDocument();
    expect(screen.queryByText('Table Schema:')).not.toBeInTheDocument();
  });
});
