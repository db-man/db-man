import React, { useRef } from 'react';

import { Github } from '@db-man/github';
import { Button, Tooltip, Typography } from 'antd';

import * as constants from '../../constants';
import reloadDbsSchemaAsync from './helpers';
import EditableTable, { TableRowType } from './EditableTable';

// Use `Typography` so can apply dark theme to text
const { Title } = Typography;

export type StorageType = {
  set: (k: string, v: string) => void;
  get: (k: string) => string | null;
  remove: (k: string) => void;
};

const saveToFile = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

/**
 * To save online db tables schema in the local db, then pages could load faster
 */
const DbConnections = ({ storage }: { storage: StorageType }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDbConnectionEnable = (enabledConnection: TableRowType) => {
    reloadDbsSchemaAsync(enabledConnection).then(() => {});
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

  return (
    <div className='dbm-db-connections'>
      <Title level={2}>Database Connections</Title>
      <EditableTable
        defaultData={JSON.parse(
          storage.get(constants.LS_KEY_DB_CONNECTIONS) || '[]'
        )}
        isConnectionEnabled={(record: TableRowType) =>
          record.owner === storage.get(constants.LS_KEY_GITHUB_OWNER) &&
          record.repo === storage.get(constants.LS_KEY_GITHUB_REPO_NAME)
        }
        onEnable={handleDbConnectionEnable}
        onSave={handleDbConnectionSave}
      />
      <Tooltip title='Export the database connection configs to a JSON file.'>
        <Button onClick={handleExport}>Export</Button>
      </Tooltip>{' '}
      <Tooltip title='Import a JSON file to replace all database connection configs'>
        <Button onClick={handleImport}>Import</Button>
      </Tooltip>{' '}
      <Tooltip title='Reset all settings in localStorage, e.g. DB connections, DB schemas'>
        <Button onClick={handleReset}>Reset</Button>
      </Tooltip>
      {/* This hidden input tag will handle importing config from a JSON file */}
      <input
        ref={fileInputRef}
        style={{ display: 'none' }}
        type='file'
        onChange={handleFileChange}
      />
    </div>
  );
};

export default DbConnections;
