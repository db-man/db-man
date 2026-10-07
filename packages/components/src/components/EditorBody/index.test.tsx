import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { message } from 'antd';
import EditorBody from './index';
import PageContext from '../../contexts/page';
import { AppContext } from '../../contexts/AppContext';
import DbColumn from '../../types/DbColumn';
import { RowType } from '../../types/Data';

const columns = [
  { id: 'name', name: 'Name', type: 'STRING' },
  {
    id: 'notes',
    name: 'Notes',
    type: 'STRING',
    'type:createUpdatePage': 'TextArea',
  },
  {
    id: 'level',
    name: 'Level',
    type: 'STRING',
    'type:createUpdatePage': 'RadioGroup',
    'ui:createUpdatePage:enum': ['low', 'high'],
  },
  {
    id: 'city',
    name: 'City',
    type: 'STRING',
    'type:createUpdatePage': 'Select',
    'ui:createUpdatePage:selectOptions': [
      { label: 'Beijing', value: 'bj' },
      { label: 'Shanghai', value: 'sh' },
    ],
  },
  { id: 'age', name: 'Age', type: 'NUMBER' },
  { id: 'active', name: 'Active', type: 'BOOL' },
  { id: 'tags', name: 'Tags', type: 'STRING_ARRAY' },
  {
    id: 'photos',
    name: 'Photos',
    type: 'STRING_ARRAY',
    'type:createUpdatePage': 'MultiLineInputBox',
  },
  { id: 'hidden', name: 'Hidden', type: 'STRING', 'type:createUpdatePage': 'HIDE' },
] as unknown as DbColumn[];

const defaultValues = { name: 'chenyang', age: 30, active: true } as RowType;

const appCtx = {
  dbs: {},
  getTablesByDbName: () => [],
  getViewsByDbName: () => [],
  getViewByDbNameViewName: () => null,
};

const pageCtx = {
  appModes: [],
  dbName: 'iam',
  tableName: 'users',
  action: 'update',
  columns,
  primaryKey: 'name',
  tables: [],
  githubDb: null,
} as any;

function renderEditor(
  props: Partial<Parameters<typeof EditorBody>[0]> = {}
) {
  const onSubmit = jest.fn();
  const onDelete = jest.fn();
  const utils = render(
    <AppContext.Provider value={appCtx}>
      <PageContext.Provider value={pageCtx}>
        <EditorBody
          defaultValues={defaultValues}
          loading={false}
          rows={[]}
          onSubmit={onSubmit}
          onDelete={onDelete}
          {...props}
        />
      </PageContext.Provider>
    </AppContext.Provider>
  );
  return { ...utils, onSubmit, onDelete };
}

/** The first form field is the "name" STRING field, rendered with an Input */
function getNameInput() {
  const firstField = document.querySelectorAll('.dbm-form-field')[0];
  return within(firstField as HTMLElement).getByRole('textbox');
}

describe('EditorBody', () => {
  it('renders one field per visible column and hides HIDE columns', () => {
    const { container } = renderEditor();
    const fields = container.querySelectorAll('.dbm-form-field');
    expect(fields.length).toBe(columns.length - 1);
    expect(container.querySelector('.dbm-form')).toHaveTextContent('Name');
    expect(container.querySelector('.dbm-form')).not.toHaveTextContent(
      'Hidden'
    );
  });

  it('renders the expected control for each column type', () => {
    renderEditor();
    // STRING -> Input
    expect(getNameInput()).toHaveValue('chenyang');
    // STRING + TextArea -> textarea
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(1);
    // STRING + RadioGroup -> radios, default to the first enum value
    expect(screen.getByRole('radio', { name: 'low' })).toBeChecked();
    // STRING + Select -> combobox
    expect(screen.getAllByRole('combobox').length).toBe(2);
    // NUMBER -> InputNumber
    expect(document.querySelector('.ant-input-number-input')).toHaveValue('30');
    // BOOL -> Switch
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('submits the form values when Save is clicked', () => {
    const { onSubmit } = renderEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'chenyang', level: 'low' })
    );
  });

  it('submits updated values after editing a field', () => {
    const { onSubmit } = renderEditor();
    fireEvent.change(getNameInput(), { target: { value: 'newname' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'newname' })
    );
  });

  it('warns when the primary key value contains whitespace', () => {
    const warnSpy = jest
      .spyOn(message, 'warning')
      .mockImplementation(() => undefined as any);
    renderEditor();
    fireEvent.change(getNameInput(), { target: { value: 'a b' } });
    expect(warnSpy).toHaveBeenCalledWith(
      'Primary key cannot contain whitespace character'
    );
  });

  it('does not warn for whitespace in a non-primary-key field', () => {
    const warnSpy = jest
      .spyOn(message, 'warning')
      .mockImplementation(() => undefined as any);
    renderEditor();
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'a b' },
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('submits when Cmd+S is pressed on a field', () => {
    const { onSubmit } = renderEditor();
    fireEvent.keyDown(getNameInput(), { code: 'KeyS', metaKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit on other key combos', () => {
    const { onSubmit } = renderEditor();
    fireEvent.keyDown(getNameInput(), { code: 'KeyS', ctrlKey: true });
    fireEvent.keyDown(getNameInput(), { code: 'KeyA', metaKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onDelete after confirming the delete popconfirm', async () => {
    const { onDelete } = renderEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(await screen.findByText('Yes'));
    expect(onDelete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'chenyang' })
    );
  });

  it('hides the Delete button when showDelete is false', () => {
    renderEditor({ showDelete: false });
    expect(
      screen.queryByRole('button', { name: 'Delete' })
    ).not.toBeInTheDocument();
  });

  it('links Reset to the create page', () => {
    renderEditor();
    expect(screen.getByText('Reset').closest('a')).toHaveAttribute(
      'href',
      '/iam/users/create'
    );
  });

  it('disables Save while loading', () => {
    renderEditor({ loading: true });
    expect(
      (screen.getByText('Save').closest('button') as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('keeps the JSON editor in sync with the form', async () => {
    renderEditor();
    fireEvent.click(screen.getByRole('tab', { name: 'JSON' }));
    const textareas = (await screen.findAllByRole('textbox')) as HTMLTextAreaElement[];
    const jsonTextarea = textareas.find((t) => t.value.startsWith('{'));
    expect(jsonTextarea?.value).toContain('"chenyang"');
  });

  it('submits values edited in the JSON editor', async () => {
    const { onSubmit } = renderEditor();
    fireEvent.click(screen.getByRole('tab', { name: 'JSON' }));
    const textareas = (await screen.findAllByRole('textbox')) as HTMLTextAreaElement[];
    const jsonTextarea = textareas.find((t) => t.value.startsWith('{'));
    expect(jsonTextarea).toBeDefined();
    fireEvent.change(jsonTextarea as HTMLElement, {
      target: { value: '{"name": "jsonname"}' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'jsonname' })
    );
  });

  it('submits the value picked in the RadioGroup', async () => {
    const { onSubmit } = renderEditor();
    fireEvent.click(screen.getByRole('radio', { name: 'high' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'high' })
    );
  });
});
