import { types } from '@db-man/github';
import { Button } from 'antd';

import EditableTable, {
  isEditingType,
  editableTableColumnType,
  TableRowType,
} from '../Settings/EditableTable';

// Type 'DbColumn[]' is not assignable to type 'TableRowType[]'.
const convertDbColumnToTableRowType = (
  columns: types.DbColumn[]
): TableRowType[] => {
  return columns.map((column) => ({
    id: column.id,
    name: column.name,
    type: column.type,
    primary: column.primary || false,
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
    primary: row.primary as boolean,
  }));
};

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
  },
  {
    title: 'primary',
    dataIndex: 'primary',
    editable: true,
    'form:valueType': 'boolean',
    'ui:type': 'checkbox',
  },
];

/**
 * Create new columns for an existing table (manage the table schema)
 */
const TableManagementForm = ({
  defaultTableSchema,
  onUpdateTableSchema,
}: {
  defaultTableSchema: types.DbTable;
  onUpdateTableSchema: (tableSchema: types.DbTable) => void;
}) => {
  const handleTableDataSave = (tableData: TableRowType[]) => {
    // storage.set(dbName, JSON.stringify(tableData));
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
        <Button type="primary" onClick={handleSaveColumns}>
          Save columns
        </Button>
      </div>
    );
  };

  return (
    <EditableTable
      rowKey="id"
      columns={dbTableColumns}
      getColumns={getColumns}
      defaultData={convertDbColumnToTableRowType(defaultTableSchema.columns)}
      onSaveTableData={handleTableDataSave}
      getFooter={getFooter}
    />
  );
};

export default TableManagementForm;
