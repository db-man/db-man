import { useState } from 'react';

import { types } from '@db-man/github';
import { Button, Tabs } from 'antd';

import EditableTable, {
  isEditingType,
  editableTableColumnType,
  TableRowType,
} from '../../components/EditableTable';
import { obj2str } from '../../components/Form/helpers';
import JsonEditor from '../../components/JsonEditor';

// Type 'DbColumn[]' is not assignable to type 'TableRowType[]'.
const convertDbColumnToTableRowType = (
  columns: types.DbColumn[]
): TableRowType[] => {
  return columns.map((column) => ({
    id: column.id,
    name: column.name,
    type: column.type,
    primary: column.primary,
    description: column.description,
  }));
};

// Type 'TableRowType[]' is not assignable to type 'DbColumn[]'.
const convertTableRowTypeToDbColumn = (
  rows: TableRowType[]
): types.DbColumn[] => {
  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    type: row.type as types.DbColumnType,
    primary: row.primary as boolean | undefined,
    description: row.description as string,
  }));
};

// TODO: should merge with the columns in SchemaPage (DbTablePage/SchemaPage.tsx)
const dbTableColumns = [
  {
    title: 'id',
    dataIndex: 'id',
    editable: true,
    'form:required': true,
  },
  {
    title: 'name',
    dataIndex: 'name',
    editable: true,
    'form:required': true,
  },
  {
    title: 'type',
    dataIndex: 'type',
    editable: true,
    'form:required': true,
    'ui:type': 'select',
    'ui:options': [
      // one of DbColumnType in @db-man/github
      { label: 'STRING', value: 'STRING' },
      { label: 'STRING_ARRAY', value: 'STRING_ARRAY' },
      { label: 'NUMBER', value: 'NUMBER' },
      { label: 'BOOL', value: 'BOOL' },
    ],
  },
  {
    title: 'primary',
    dataIndex: 'primary',
    editable: true,
    'form:valueType': 'boolean',
    'ui:type': 'checkbox',
  },
  {
    title: 'description',
    dataIndex: 'description',
    editable: true,
  },
];

/**
 * Create new columns for an existing table (manage the table schema)
 */
const TableManagementEditableTable = ({
  isLoading,
  defaultTableSchema,
  onUpdateTableSchema,
}: {
  isLoading: boolean;
  defaultTableSchema: types.DbTable;
  // When table state changes, callback to parent component to send http request.
  onUpdateTableSchema: (tableSchema: types.DbTable) => void;
}) => {
  const [jsonStr, setJsonStr] = useState(obj2str(defaultTableSchema));

  const handleTableDataSave = (tableData: TableRowType[]) => {
    setJsonStr(obj2str(tableData));
  };

  const getColumns = (
    operationColumn: editableTableColumnType,
    isEditing: isEditingType
  ) => {
    const columns = [...dbTableColumns, operationColumn];

    const mergedColumns = columns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
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
      };
    });

    return mergedColumns;
  };

  const getFooter = (tableData: TableRowType[]) => {
    const handleSaveColumns = () => {
      onUpdateTableSchema({
        ...defaultTableSchema,
        columns: convertTableRowTypeToDbColumn(tableData),
      });
    };
    return (
      <div>
        <Button type="primary" disabled={isLoading} onClick={handleSaveColumns}>
          Save columns
        </Button>
      </div>
    );
  };

  const tabsItems = [
    {
      label: 'Table',
      key: 'table',
      children: (
        <EditableTable
          rowKey="id"
          loading={isLoading}
          columns={dbTableColumns}
          getColumns={getColumns}
          defaultData={convertDbColumnToTableRowType(
            defaultTableSchema.columns
          )}
          onSaveTableData={handleTableDataSave}
          getFooter={getFooter}
        />
      ),
    },
    {
      label: 'JSON',
      key: 'json',
      children: (
        <JsonEditor
          value={jsonStr}
          onTextAreaChange={setJsonStr}
          onJsonObjectChange={() => {
            // TODO: When JSON editor value changes and value is a valid JSON object, send http request to update table schema.
            alert('Not implemented');
          }}
          onSave={() => {
            // TODO: When press 's' key in JSON editor, send http request to update table schema.
            alert('Not implemented');
          }}
        />
      ),
    },
  ];

  return (
    <>
      <Tabs defaultActiveKey="table" items={tabsItems} />
    </>
  );
};

export default TableManagementEditableTable;
