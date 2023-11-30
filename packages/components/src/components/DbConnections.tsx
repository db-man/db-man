import React, { useRef } from 'react';

import { Button } from 'antd';
import { GithubDb } from '@db-man/github';

import * as constants from '../constants';
import reloadDbsSchemaAsync from '../pages/helpers';
import EditableTable from './EditableTable';

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
    const githubDb = new GithubDb({
      personalAccessToken: storage.get(
        constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN
      ),
      repoPath: storage.get(constants.LS_KEY_GITHUB_REPO_PATH),
      owner: storage.get(constants.LS_KEY_GITHUB_OWNER),
      repoName: storage.get(constants.LS_KEY_GITHUB_REPO_NAME),
      dbsSchema: storage.get(constants.LS_KEY_DBS_SCHEMA),
    });
    const { github } = githubDb;
    reloadDbsSchemaAsync(github, githubDb).then(() => {});
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
    <div className='dm-db-connections'>
      <h2>Database Connections 2</h2>
      <EditableTable storage={storage} onEnable={handleDbConnectionEnable} />
      <Button onClick={handleExport}>Export</Button>{' '}
      <Button onClick={handleImport}>Import</Button>
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
