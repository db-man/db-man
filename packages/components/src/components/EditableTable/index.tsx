/* eslint-disable react/prop-types, react/jsx-props-no-spreading */

import React, { useState } from 'react';

import { Table, Popconfirm, Form, Typography, Button } from 'antd';

import EditableCell from './EditableCell';

export type TableRowType = {
  [key: string]: string | boolean | undefined;
};

// This is extanding from ant design table column type
export type editableTableColumnType = {
  title: React.ReactNode;
  dataIndex: string;
  editable?: boolean;
  'ui:type'?: string;
  'ui:options'?: { label: string; value: string }[];
  'form:required'?: boolean;
  'form:valueType'?: string; // 'boolean' or 'string', default is 'string'
  width?: string;
  render?: (text: string, record: TableRowType) => React.ReactNode;
};

export type isEditingType = (record: TableRowType) => boolean;

function EditableTable({
  rowKey,
  defaultData,
  onSaveTableData,
  columns,
  getColumns,
  getFooter,
  getAdditionalOperationButtons,
  loading,
}: {
  rowKey: string;
  defaultData: TableRowType[];
  // When row add/delete, call this function to save the table data
  onSaveTableData: (data: TableRowType[]) => void;
  columns: editableTableColumnType[];
  getColumns: (
    operationColumn: editableTableColumnType,
    isEditing: isEditingType
  ) => editableTableColumnType[];
  getFooter?: (tableData: TableRowType[]) => React.ReactNode;
  getAdditionalOperationButtons?: (record: TableRowType) => React.ReactNode;
  loading?: boolean;
}) {
  const [form] = Form.useForm();
  const [tableData, setData] = useState<TableRowType[]>(defaultData);
  const [editingKey, setEditingKey] = useState('');

  const isEditing: isEditingType = (record: TableRowType) => {
    return record[rowKey] === editingKey;
  };

  const saveTableData = (d: TableRowType[]) => {
    setData(d);
    onSaveTableData(d);
  };

  const handleAddRow = () => {
    const newData = [...tableData];
    const newRow = {} as TableRowType;
    columns.forEach((col) => {
      newRow[col.dataIndex] = '';
      if (col['form:valueType'] === 'boolean') {
        newRow[col.dataIndex] = false;
      }
    });
    newData.push({
      ...newRow,
    });
    setData(newData);
    form.setFieldsValue({
      ...newRow,
    });
    setEditingKey(newData[newData.length - 1][rowKey] as string);
  };

  const edit = (record: TableRowType) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record[rowKey] as string);
  };

  const cancel = (record: TableRowType) => {
    setEditingKey('');
    // Remove tmp row which is the last row
    if (record[rowKey] === '') {
      const newData = [...tableData];
      const index = newData.findIndex((item) => item[rowKey] === '');
      newData.splice(index, 1);
      setData(newData);
    }
  };

  const saveRow = async (key: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...tableData];
      const index = newData.findIndex((item) => key === item[rowKey]);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        saveTableData(newData);
        setEditingKey('');
      } else {
        alert('TODO');
        // newData.push({
        //   ...row,
        //   key: tableData.length === 0 ? 1 : Math.max(...tableData.map(({ key: k }) => k)) + 1,
        // });
        // setData(newData);
        // setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo); // eslint-disable-line no-console
    }
  };

  const handleDelete = (record: TableRowType) => {
    const newData = [...tableData];
    const index = newData.findIndex((item) => item[rowKey] === record[rowKey]);
    newData.splice(index, 1);
    saveTableData(newData);
  };

  const operationColumn: editableTableColumnType = {
    title: (
      <div>
        Operation{' '}
        <Button
          className="dbm-editable-table-add-row-btn"
          size="small"
          disabled={editingKey !== ''}
          onClick={handleAddRow}
        >
          Add
        </Button>
      </div>
    ),
    dataIndex: 'operation',
    render: (_: any, record: TableRowType) => {
      const editable = isEditing(record);
      return editable ? (
        <span>
          <Typography.Link
            className="dbm-editable-table-save-link"
            style={{
              marginRight: 8,
            }}
            onClick={() => saveRow(record[rowKey] as string)}
          >
            Save
          </Typography.Link>
          <Popconfirm title="Sure to cancel?" onConfirm={() => cancel(record)}>
            <Button type="link">Cancel</Button>
          </Popconfirm>
        </span>
      ) : (
        <span>
          <Typography.Link
            disabled={editingKey !== ''}
            onClick={() => edit(record)}
          >
            Edit
          </Typography.Link>
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
          {getAdditionalOperationButtons?.(record)}
        </span>
      );
    },
  };

  const mergedColumns = getColumns(operationColumn, isEditing);

  return (
    <Form form={form} component={false}>
      <Table
        bordered
        rowClassName="editable-row"
        size="small"
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        rowKey={rowKey}
        loading={loading}
        dataSource={tableData}
        columns={mergedColumns}
        pagination={false}
      />
      {getFooter && getFooter(tableData)}
    </Form>
  );
}

export default EditableTable;
