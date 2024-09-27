import React, { useRef } from 'react';

import { Button, Tooltip, Typography } from 'antd';
import { Github } from '@db-man/github';

import * as constants from '../constants';
import reloadDbsSchemaAsync from '../pages/helpers';
import EditableTable from './EditableTable';

// Use `Typography` so can apply dark theme to text
const { Title } = Typography;

export type StorageType = {
  set: (k: string, v: string) => void;
  get: (k: string) => string | null;
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

  const handleDbConnectionEnable = () => {
    const github = new Github({
      personalAccessToken:
        storage.get(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN) || '',
      owner: storage.get(constants.LS_KEY_GITHUB_OWNER) || '',
      repoName: storage.get(constants.LS_KEY_GITHUB_REPO_NAME) || '',
    });
    reloadDbsSchemaAsync(github).then(() => {});
  };

  const handleExport = () => {
    const jsonStrData = JSON.stringify({
      [constants.LS_KEY_DBS_SCHEMA]: storage.get(constants.LS_KEY_DBS_SCHEMA),
      [constants.LS_KEY_DB_CONNECTIONS]: storage.get(
        constants.LS_KEY_DB_CONNECTIONS
      ),
    });
    saveToFile(jsonStrData, 'DbManExportData.json');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const jsonString = e.target?.result as string;
      const parsedData = JSON.parse(jsonString);

      storage.set(
        constants.LS_KEY_DBS_SCHEMA,
        parsedData[constants.LS_KEY_DBS_SCHEMA]
      );
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
      <EditableTable storage={storage} onEnable={handleDbConnectionEnable} />
      <Tooltip title='Export the database connection configs to a JSON file.'>
        <Button onClick={handleExport}>Export</Button>
      </Tooltip>{' '}
      <Tooltip title='Import a JSON file to replace all database connection configs'>
        <Button onClick={handleImport}>Import</Button>
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
