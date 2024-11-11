import React from 'react';

import { types } from '@db-man/github';

import { RowType } from '../types/Data';

// TODO: move this to @db-man/github
export interface GithubDbType {
  getTableRows: (
    dbName: string,
    tableName: string,
    signal?: AbortSignal
  ) => Promise<{ content: RowType[]; sha: string }>;
  getTableInsights: (
    dbName: string,
    tableName: string,
    signal?: AbortSignal
  ) => Promise<string>;
  updateTableFile: (
    dbName: string,
    tableName: string,
    content: RowType[],
    tableFileSha: types.ShaType
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
// Setter: src/layout/DbTablePage.tsx
const CommonPageContext = React.createContext<CommonPageContextType>({
  appModes: [], // all db modes: 'split-table'
  githubDb: null, // GitHubDb from @db-man/github
});

export default CommonPageContext;
