import React from 'react';

import { RowType } from '../types/Data';

export interface GithubDbType {
  getTableRows: (
    dbName: string,
    tableName: string,
    signal?: AbortSignal
  ) => Promise<{ content: RowType[]; sha: string }>;
  updateTableFile: (
    dbName: string,
    tableName: string,
    content: RowType[],
    tableFileSha: string | null
  ) => Promise<{
    commit: {
      html_url?: string;
    };
  }>;
  // updateTableFile: any;
  updateRecordFile: (
    dbName: string,
    tableName: string,
    recordId: string,
    content: RowType,
    recordFileSha: string | null
  ) => Promise<{
    commit: {
      html_url?: string;
    };
  }>;
  getDataUrl: (dbName: string, tableName: string) => string;
  getRecordFileContentAndSha: (
    dbName: string,
    tableName: string,
    recordId: string,
    signal?: AbortSignal
  ) => Promise<{ content: RowType; sha: string }>;
  getGitHubFullPath: (path: string) => string;
  getDataPath: (dbName: string, tableName: string) => string;
  deleteRecordFile: (
    dbName: string,
    tableName: string,
    recordId: string,
    recordFileSha: string | null
  ) => Promise<{
    commit: {
      html_url?: string;
    };
  }>;
}

export interface CommonPageContextType {
  appModes: string[];
  githubDb: GithubDbType | null;
}

// Store all page info, include db, table, and columns
// Setter: src/layout/PageWrapper.tsx
const CommonPageContext = React.createContext<CommonPageContextType>({
  appModes: [], // all app modes: 'split-table'
  githubDb: null, // GitHubDb from @db-man/github
});

export default CommonPageContext;
