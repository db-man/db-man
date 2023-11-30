import React from 'react';

import DbColumn from '../types/DbColumn';
import Databases from '../types/Databases';
import { RowType } from '../types/Data';

export interface PageContextType {
  appModes: string[];
  dbs?: Databases;
  dbName: string;
  tableName: string;
  action: string;
  columns: DbColumn[];
  primaryKey: string;
  tables: string[];
  githubDb: {
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
  } | null;
}

// Store all page info, include db, table, and columns
// Setter: src/layout/PageWrapper.tsx
const PageContext = React.createContext<PageContextType>({
  appModes: [], // all app modes: 'split-table'
  dbs: {}, // all dbs
  dbName: '',
  tableName: '',
  action: '',
  columns: [],
  primaryKey: '', // primary key of current db table
  tables: [],
  githubDb: null, // GitHubDb from @db-man/github
});

export default PageContext;
