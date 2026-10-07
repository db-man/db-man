import React from 'react';
import { render, screen } from '@testing-library/react';
import FieldWrapperForCreateUpdatePage from './FieldWrapperForCreateUpdatePage';
import PageContext from '../contexts/page';
import DbColumn from '../types/DbColumn';

function renderWithPageCtx(
  ui: React.ReactNode,
  pageCtx: Partial<React.ComponentProps<typeof PageContext.Provider>['value']>
) {
  return render(
    <PageContext.Provider value={pageCtx as any}>{ui}</PageContext.Provider>
  );
}

const column = { id: 'name', name: 'Name', type: 'STRING' } as DbColumn;

describe('FieldWrapperForCreateUpdatePage', () => {
  it('renders the column label and children', () => {
    const { container } = renderWithPageCtx(
      <FieldWrapperForCreateUpdatePage column={column}>
        <div>child-body</div>
      </FieldWrapperForCreateUpdatePage>,
      { appModes: [], primaryKey: 'name' }
    );
    expect(container.querySelector('.dbm-field-label')).toHaveTextContent(
      'Name'
    );
    expect(screen.getByText('child-body')).toBeInTheDocument();
  });

  it('shows the primary key popover icon in split-table mode', () => {
    const { container } = renderWithPageCtx(
      <FieldWrapperForCreateUpdatePage column={column}>
        <div />
      </FieldWrapperForCreateUpdatePage>,
      { appModes: ['split-table'], primaryKey: 'name' }
    );
    expect(
      container.querySelector('.anticon-question-circle')
    ).toBeInTheDocument();
  });

  it('hides the popover icon when the column is not the primary key', () => {
    const { container } = renderWithPageCtx(
      <FieldWrapperForCreateUpdatePage column={column}>
        <div />
      </FieldWrapperForCreateUpdatePage>,
      { appModes: ['split-table'], primaryKey: 'id' }
    );
    expect(
      container.querySelector('.anticon-question-circle')
    ).not.toBeInTheDocument();
  });

  it('hides the popover icon when not in split-table mode', () => {
    const { container } = renderWithPageCtx(
      <FieldWrapperForCreateUpdatePage column={column}>
        <div />
      </FieldWrapperForCreateUpdatePage>,
      { appModes: [], primaryKey: 'name' }
    );
    expect(
      container.querySelector('.anticon-question-circle')
    ).not.toBeInTheDocument();
  });
});
