import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RefTableLinks from './RefTableLinks';
import PageContext from '../contexts/page';
import { AppContext } from '../contexts/AppContext';

const tables = [
  { name: 'users', columns: [{ id: 'name', name: 'Name', primary: true }] },
  { name: 'nopk', columns: [{ id: 'foo', name: 'Foo' }] },
] as any;

const appCtx = {
  dbs: {},
  getTablesByDbName: () => tables,
  getViewsByDbName: () => [],
  getViewByDbNameViewName: () => null,
};

const pageCtx = {
  appModes: [],
  dbName: 'iam',
  tableName: 'records',
  action: 'get',
  columns: [],
  primaryKey: 'name',
  tables,
  githubDb: null,
} as any;

const column = {
  id: 'user_name',
  name: 'User',
  type: 'STRING',
  referenceTable: 'users',
} as any;

function renderRefTableLinks(value: string | string[] | null, col = column) {
  return render(
    <MemoryRouter>
      <AppContext.Provider value={appCtx}>
        <PageContext.Provider value={pageCtx}>
          <RefTableLinks value={value} column={col} />
        </PageContext.Provider>
      </AppContext.Provider>
    </MemoryRouter>
  );
}

describe('RefTableLinks', () => {
  it('renders one link for a string value', () => {
    renderRefTableLinks('chen');
    expect(screen.getByText('chen').closest('a')).toHaveAttribute(
      'href',
      '/iam/users/get?name=chen'
    );
  });

  it('renders one link per item for an array value', () => {
    renderRefTableLinks(['a', 'b']);
    expect(screen.getByText('a').closest('a')).toHaveAttribute(
      'href',
      '/iam/users/get?name=a'
    );
    expect(screen.getByText('b').closest('a')).toHaveAttribute(
      'href',
      '/iam/users/get?name=b'
    );
  });

  it('renders no links for a null value', () => {
    renderRefTableLinks(null);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a hint when the reference table is missing', () => {
    const badColumn = { ...column, referenceTable: 'ghost' } as any;
    renderRefTableLinks('chen', badColumn);
    expect(screen.getByText('Ref table not found')).toBeInTheDocument();
  });

  it('renders a hint when the reference table has no primary column', () => {
    const badColumn = { ...column, referenceTable: 'nopk' } as any;
    renderRefTableLinks('chen', badColumn);
    expect(
      screen.getByText('Ref table primary column not found')
    ).toBeInTheDocument();
  });
});
