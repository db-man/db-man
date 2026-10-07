import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';

import EditableTable, {
  editableTableColumnType,
  isEditingType,
  TableRowType,
} from './index';

const columns: editableTableColumnType[] = [
  { title: 'id', dataIndex: 'id', editable: true, 'form:required': true },
  {
    title: 'active',
    dataIndex: 'active',
    editable: true,
    'form:valueType': 'boolean',
    'ui:type': 'checkbox',
  },
  {
    title: 'type',
    dataIndex: 'type',
    editable: true,
    'ui:type': 'select',
    'ui:options': [{ label: 'STRING', value: 'STRING' }],
  },
];

/**
 * Mirrors what the real callers do (`TableManagementEditableTable`,
 * `DbConnections`): mark every editable column with an `onCell` which tells
 * `EditableCell` whether the row is being edited.
 */
const getColumns = (
  operationColumn: editableTableColumnType,
  isEditing: isEditingType
) =>
  [...columns, operationColumn].map((col) =>
    col.editable
      ? {
          ...col,
          onCell: (record: TableRowType) => ({
            record,
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
            'ui:type': col['ui:type'],
            'ui:options': col['ui:options'],
            'form:required': col['form:required'],
            'form:valueType': col['form:valueType'],
          }),
        }
      : col
  );

const defaultData = [{ id: 'userId' }, { id: 'name' }];

const renderTable = (
  props: Partial<ComponentProps<typeof EditableTable>> = {}
) => {
  const onSaveTableData = jest.fn();
  render(
    <EditableTable
      rowKey="id"
      columns={columns}
      getColumns={getColumns}
      defaultData={defaultData}
      onSaveTableData={onSaveTableData}
      {...props}
    />
  );
  return { onSaveTableData };
};

const addRow = () => fireEvent.click(screen.getByRole('button', { name: 'Add' }));
const clickSave = () => fireEvent.click(screen.getByText('Save'));

const confirmPopconfirm = async () =>
  fireEvent.click(await screen.findByRole('button', { name: 'OK' }));

describe('EditableTable', () => {
  it('should render the rows it was given, none of them editable', () => {
    renderTable();

    expect(screen.getByText('userId')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getAllByText('Edit')).toHaveLength(2);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should render the footer built from the current rows', () => {
    renderTable({
      getFooter: (tableData) => (
        <span>Total {tableData.length} columns</span>
      ),
    });

    expect(screen.getByText('Total 2 columns')).toBeInTheDocument();
  });

  it('should add an empty row and put it into edit mode', () => {
    renderTable();

    addRow();

    // The temporary row has an empty rowKey, which is the only way to edit it.
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // One checkbox column and one select column, both editable. Rows which are
    // not being edited render a disabled checkbox, so there is one per row.
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    // Known quirk: `handleAddRow` sets `editingKey` to the new row key, which is
    // '' - the same value used for "nothing is being edited". So the
    // `disabled={editingKey !== ''}` guard on Add does not cover the temporary
    // row and the button stays clickable.
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });

  it('should disable adding while an existing row is being edited', () => {
    renderTable();

    fireEvent.click(screen.getAllByText('Edit')[0]);

    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('should save the value typed into the new row', async () => {
    const { onSaveTableData } = renderTable();

    addRow();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'newId' },
    });
    clickSave();

    await waitFor(() => expect(onSaveTableData).toHaveBeenCalledTimes(1));

    const saved = onSaveTableData.mock.calls[0][0];
    expect(saved).toHaveLength(3);
    expect(saved[2]).toEqual({ id: 'newId', active: false, type: '' });
  });

  it('should not save a new row whose required field is empty', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const { onSaveTableData } = renderTable();

    addRow();
    clickSave();

    expect(await screen.findByText('Please Input id!')).toBeInTheDocument();
    expect(onSaveTableData).not.toHaveBeenCalled();

    consoleLog.mockRestore();
  });

  it('should drop the temporary row when the edit is cancelled', async () => {
    const { onSaveTableData } = renderTable();

    addRow();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await confirmPopconfirm();

    await waitFor(() =>
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
    expect(onSaveTableData).not.toHaveBeenCalled();
  });

  it('should delete the row which was confirmed', async () => {
    const { onSaveTableData } = renderTable();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await confirmPopconfirm();

    await waitFor(() =>
      expect(onSaveTableData).toHaveBeenCalledWith([{ id: 'name' }])
    );
    expect(screen.queryByText('userId')).not.toBeInTheDocument();
  });

  it('should render the extra operation buttons supplied by the caller', () => {
    renderTable({
      getAdditionalOperationButtons: (record) => (
        <span>extra {record.id as string}</span>
      ),
    });

    expect(screen.getByText('extra userId')).toBeInTheDocument();
    expect(screen.getByText('extra name')).toBeInTheDocument();
  });
});
