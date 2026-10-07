import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FieldWrapperForDetailPage from './FieldWrapperForDetailPage';
import PageContext from '../contexts/page';
import { AppContext } from '../contexts/AppContext';
import * as constants from '../constants';
import DbColumn from '../types/DbColumn';

const tables = [
  { name: 'users', columns: [{ id: 'name', name: 'Name', primary: true }] },
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
  tableName: 'users',
  action: 'get',
  columns: [],
  primaryKey: 'name',
  tables,
  githubDb: null,
} as any;

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AppContext.Provider value={appCtx}>
        <PageContext.Provider value={pageCtx}>{ui}</PageContext.Provider>
      </AppContext.Provider>
    </MemoryRouter>
  );
}

describe('FieldWrapperForDetailPage', () => {
  it('renders the column label and children', () => {
    const column = { id: 'name', name: 'Name', type: 'STRING' } as DbColumn;
    const { container } = renderWithProviders(
      <FieldWrapperForDetailPage column={column} value='chenyang'>
        <div>child-body</div>
      </FieldWrapperForDetailPage>
    );
    expect(container.querySelector('.dbm-field-label')).toHaveTextContent(
      'Name'
    );
    expect(container.querySelector('.dbm-field-label')).toHaveTextContent(
      'name'
    );
    expect(container.querySelector('.dbm-field-label')).not.toHaveTextContent(
      'count:'
    );
    expect(screen.getByText('child-body')).toBeInTheDocument();
  });

  it('uses the string-array class name and shows the element count for STRING_ARRAY', () => {
    const column = {
      id: 'tags',
      name: 'Tags',
      type: constants.STRING_ARRAY,
    } as DbColumn;
    const { container } = renderWithProviders(
      <FieldWrapperForDetailPage column={column} value={['a', 'b']} children={null} />
    );
    expect(container.querySelector('.dbm-field-label')).toHaveTextContent(
      '(count:2)'
    );
    expect(
      container.querySelector('.dbm-string-array-form-field')
    ).toBeInTheDocument();
  });

  it('shows count 0 when a STRING_ARRAY value is empty', () => {
    const column = {
      id: 'tags',
      name: 'Tags',
      type: constants.STRING_ARRAY,
    } as DbColumn;
    const { container } = renderWithProviders(
      <FieldWrapperForDetailPage column={column} value={[]} children={null} />
    );
    expect(container.querySelector('.dbm-field-label')).toHaveTextContent(
      '(count:0)'
    );
  });

  it('renders a RefTableLink when the column references another table', () => {
    const column = {
      id: 'user_name',
      name: 'User',
      type: 'STRING',
      referenceTable: 'users',
    } as DbColumn;
    renderWithProviders(
      <FieldWrapperForDetailPage column={column} value='chenyang' children={null} />
    );
    const create = screen.getByRole('link', { name: 'Create' });
    expect(create).toHaveAttribute('href', '/iam/users/create?name=chenyang');
  });

  it('does not render a RefTableLink when the value is an array', () => {
    const column = {
      id: 'user_name',
      name: 'User',
      type: constants.STRING_ARRAY,
      referenceTable: 'users',
    } as DbColumn;
    renderWithProviders(
      <FieldWrapperForDetailPage column={column} value={['a', 'b']} children={null} />
    );
    expect(screen.queryByRole('link', { name: 'Create' })).not.toBeInTheDocument();
  });
});
