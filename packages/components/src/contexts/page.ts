import React from 'react';

import { types, GithubDb } from '@db-man/github';

import DbColumn from '../types/DbColumn';
// import { GithubDbType } from './commonPage';

export interface PageContextType {
  appModes: string[];
  dbs?: types.DatabaseMap;
  dbName: string;
  tableName: string;
  action: string;
  columns: DbColumn[];
  primaryKey: string;
  tables: string[];
  // githubDb: GithubDbType | null;
  githubDb: GithubDb | null;
}

// Store all page info, include db, table, and columns
// Setter: src/layout/DbTablePage.tsx
const PageContext = React.createContext<PageContextType>({
  // TODO: change appModes to dbModes to align with the key name in dbs.json
  appModes: [], // all db modes: 'split-table'
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
