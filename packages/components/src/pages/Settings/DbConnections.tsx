import React, { useRef } from 'react';

import { Button, message, Tooltip, Typography } from 'antd';
import EditableTable, {
  isEditingType,
  editableTableColumnType,
  TableRowType,
} from '../../components/EditableTable';

import * as constants from '../../constants';
import { saveConnectionToLocalStorage, reloadDbsSchemaAsync } from './helpers';

// Use `Typography` so can apply dark theme to text
const { Title } = Typography;

export type StorageType = {
  set: (k: string, v: string) => void;
  get: (k: string) => string | null;
  remove: (k: string) => void;
};

const connectionColumns = [
  { title: 'key', dataIndex: 'key', editable: true },
  {
    title: 'token',
    dataIndex: 'token',
    width: '10%',
    render: (token: string) => (
      <textarea
        style={{ resize: 'none' }}
        rows={1}
        cols={10}
        disabled
        defaultValue={token}
      />
    ),
    editable: true,
  },
  {
    title: 'owner',
    dataIndex: 'owner',
    width: '10%',
    editable: true,
  },
  {
    title: 'repo',
    dataIndex: 'repo',
    width: '10%',
    editable: true,
  },
];

const saveToFile = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const DbConnections = ({ storage }: { storage: StorageType }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDbConnectionEnable = async (enabledConnection: TableRowType) => {
    // Clear UI state
    localStorage.removeItem(constants.LS_QUERY_PAGE_SELECTED_TABLE_NAMES);

    saveConnectionToLocalStorage(
      enabledConnection.token as string,
      enabledConnection.owner as string,
      enabledConnection.repo as string
    );

    await reloadDbsSchemaAsync(
      enabledConnection.token as string,
      enabledConnection.owner as string,
      enabledConnection.repo as string,
      messageApi
    );
  };

  const handleDbConnectionSave = (connections: TableRowType[]) => {
    storage.set(constants.LS_KEY_DB_CONNECTIONS, JSON.stringify(connections));
  };

  const handleExport = () => {
    const jsonStrData = JSON.stringify({
      [constants.LS_KEY_DB_CONNECTIONS]: storage.get(
        constants.LS_KEY_DB_CONNECTIONS
      ),
    });
    saveToFile(jsonStrData, 'DbManExportData.json');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    // remove db info
    storage.remove(constants.LS_KEY_DB_CONNECTIONS);
    storage.remove(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN);
    storage.remove(constants.LS_KEY_GITHUB_OWNER);
    storage.remove(constants.LS_KEY_GITHUB_REPO_NAME);
    storage.remove(constants.LS_KEY_GITHUB_REPO_PATH);
    storage.remove(constants.LS_KEY_GITHUB_REPO_MODES);
    storage.remove(constants.LS_KEY_DBS_SCHEMA);
    // remove switches
    storage.remove(constants.LS_IS_DARK_THEME);
    storage.remove(constants.LS_SHOW_DOWNLOAD_BUTTON);

    alert('Finish reset, refresh the webpage.');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const jsonString = e.target?.result as string;
      const parsedData = JSON.parse(jsonString);

      storage.set(
        constants.LS_KEY_DB_CONNECTIONS,
        parsedData[constants.LS_KEY_DB_CONNECTIONS]
      );

      alert('Finish importing, refresh and enable one connection.');
    };

    reader.readAsText(file);
  };

  const getColumns = (
    operationColumn: editableTableColumnType,
    isEditing: isEditingType
  ) => {
    const transformedColumns = connectionColumns.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record: TableRowType) => {
          return {
            record,
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
          };
        },
      };
    });

    return [...transformedColumns, operationColumn];
  };

  return (
    <div className="dbm-db-connections">
      {contextHolder}
      <Title level={2}>Database Connections</Title>
      <div>
        <div>
          Enabled connection: {storage.get(constants.LS_KEY_GITHUB_OWNER)}/
          {storage.get(constants.LS_KEY_GITHUB_REPO_NAME)}
        </div>
      </div>
      <EditableTable
        rowKey="key"
        columns={connectionColumns}
        getColumns={getColumns}
        defaultData={JSON.parse(
          storage.get(constants.LS_KEY_DB_CONNECTIONS) || '[]'
        )}
        getAdditionalOperationButtons={(record) => (
          <Button
            className="dbm-enable-connection-btn"
            type="link"
            onClick={() => handleDbConnectionEnable(record)}
          >
            Enable
          </Button>
        )}
        onSaveTableData={handleDbConnectionSave}
      />
      <Tooltip title="Export the database connection configs to a JSON file.">
        <Button onClick={handleExport}>Export</Button>
      </Tooltip>{' '}
      <Tooltip title="Import a JSON file to replace all database connection configs">
        <Button onClick={handleImport}>Import</Button>
      </Tooltip>{' '}
      <Tooltip title="Reset all settings in localStorage, e.g. DB connections, DB schemas">
        <Button onClick={handleReset}>Reset</Button>
      </Tooltip>
      {/* This hidden input tag will handle importing config from a JSON file */}
      <input
        ref={fileInputRef}
        style={{ display: 'none' }}
        type="file"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default DbConnections;
