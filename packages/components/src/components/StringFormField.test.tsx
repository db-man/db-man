import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { message } from 'antd';
import StringFormField from './StringFormField';
import PageContext from '../contexts/page';
import { AppContext } from '../contexts/AppContext';
import DbColumn from '../types/DbColumn';
import { RowType } from '../types/Data';

jest.mock('lodash.debounce', () => (fn: any) => fn);

const tables = [
  { name: 'users', columns: [{ id: 'name', name: 'Name', primary: true }] },
] as any;

const appCtx = {
  dbs: {},
  getTablesByDbName: () => tables,
  getViewsByDbName: () => [],
  getViewByDbNameViewName: () => null,
};

function makePageCtx(overrides: Record<string, any> = {}) {
  return {
    appModes: [],
    dbName: 'iam',
    tableName: 'users',
    action: 'update',
    columns: [],
    primaryKey: 'name',
    tables,
    githubDb: null,
    ...overrides,
  };
}

const column = { id: 'name', name: 'Name', type: 'STRING' } as DbColumn;

function renderField({
  column: col = column,
  value = '',
  rows = [] as RowType[],
  pageCtx = makePageCtx(),
  onChange = () => {},
}: {
  column?: DbColumn;
  value?: string;
  rows?: RowType[];
  pageCtx?: Record<string, any>;
  onChange?: (value: string, event: any) => void;
}) {
  return render(
    <MemoryRouter>
      <AppContext.Provider value={appCtx}>
        <PageContext.Provider value={pageCtx as any}>
          <StringFormField
            column={col}
            rows={rows}
            value={value}
            onChange={onChange}
          />
        </PageContext.Provider>
      </AppContext.Provider>
    </MemoryRouter>
  );
}

describe('StringFormField', () => {
  it('renders an input with the given value', () => {
    renderField({ value: 'chenyang' });
    expect(screen.getByRole('textbox')).toHaveValue('chenyang');
  });

  it('calls onChange when typing', () => {
    const onChange = jest.fn();
    renderField({ onChange });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'x' },
    });
    expect(onChange).toHaveBeenCalledWith('x', expect.anything());
  });

  it('renders preset buttons which fill the field', () => {
    const onChange = jest.fn();
    const col = {
      ...column,
      'ui:createUpdatePage:presets': ['alice', 'bob'],
    } as DbColumn;
    renderField({ column: col, onChange });
    fireEvent.click(screen.getByRole('button', { name: 'alice' }));
    expect(onChange).toHaveBeenCalledWith('alice', expect.anything());
  });

  it('warns when the primary key duplicates an existing row', () => {
    const warnSpy = jest
      .spyOn(message, 'warning')
      .mockImplementation(() => undefined as any);
    const onChange = jest.fn();
    renderField({ rows: [{ name: 'taken' }] as RowType[], onChange });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'taken' },
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({ type: 'div' })
    );
  });

  it('does not warn when the primary key value is unique', () => {
    const warnSpy = jest
      .spyOn(message, 'warning')
      .mockImplementation(() => undefined as any);
    renderField({ rows: [{ name: 'taken' }] as RowType[] });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'free' },
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('skips the duplicate check in split-table mode', () => {
    const warnSpy = jest
      .spyOn(message, 'warning')
      .mockImplementation(() => undefined as any);
    renderField({
      rows: [{ name: 'taken' }] as RowType[],
      pageCtx: makePageCtx({ appModes: ['split-table'] }),
    });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'taken' },
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when the filename is too long in split-table mode', () => {
    const warnSpy = jest
      .spyOn(message, 'warning')
      .mockImplementation(() => undefined as any);
    renderField({
      pageCtx: makePageCtx({ appModes: ['split-table'] }),
    });
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'a'.repeat(300) },
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(typeof warnSpy.mock.calls[0][0]).toBe('string');
  });

  it('marks the input as error when the initial filename is too long in split-table mode', () => {
    renderField({
      value: 'a'.repeat(300),
      pageCtx: makePageCtx({ appModes: ['split-table'] }),
    });
    expect(screen.getByRole('textbox').className).toContain(
      'ant-input-status-error'
    );
  });

  it('shows a field value warning when the value type mismatches', () => {
    renderField({ value: 123 as any });
    expect(screen.getByRole('alert')).toHaveTextContent('number');
  });

  it('renders a RefTableLink when the column references another table', () => {
    const col = {
      id: 'name',
      name: 'Name',
      type: 'STRING',
      referenceTable: 'users',
    } as DbColumn;
    renderField({ column: col, value: 'chenyang' });
    expect(
      screen.getByRole('link', { name: 'Create' })
    ).toHaveAttribute('href', '/iam/users/create?name=chenyang');
  });
});
