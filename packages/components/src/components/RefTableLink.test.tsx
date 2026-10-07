import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RefTableLink from './RefTableLink';

const tables = [
  { name: 'users', columns: [{ id: 'name', name: 'Name', primary: true }] },
] as any;

const column = {
  id: 'user_name',
  name: 'User',
  type: 'STRING',
  referenceTable: 'users',
} as any;

function renderLink(props: { column?: any; tables?: any; value?: string } = {}) {
  const { column: col = column, tables: tbs = tables, value = 'chen' } = props;
  return render(
    <MemoryRouter>
      <RefTableLink dbName='iam' tables={tbs} column={col} value={value} />
    </MemoryRouter>
  );
}

describe('RefTableLink', () => {
  it('renders Create, Update and Get links to the reference table', () => {
    renderLink();
    expect(screen.getByText('Create').closest('a')).toHaveAttribute(
      'href',
      '/iam/users/create?name=chen'
    );
    expect(screen.getByText('Update').closest('a')).toHaveAttribute(
      'href',
      '/iam/users/update?name=chen'
    );
    expect(screen.getByText('Get').closest('a')).toHaveAttribute(
      'href',
      '/iam/users/get?name=chen'
    );
  });

  it('renders nothing when the column has no reference table', () => {
    const plainColumn = { id: 'name', name: 'Name', type: 'STRING' } as any;
    const { container } = renderLink({ column: plainColumn });
    expect(container).toBeEmptyDOMElement();
  });
});
