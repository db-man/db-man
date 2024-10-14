import React from 'react';

import DbColumn from '../types/DbColumn';
import Databases from '../types/Databases';
import { GithubDbType } from './commonPage';

export interface PageContextType {
  appModes: string[];
  dbs?: Databases;
  dbName: string;
  tableName: string;
  action: string;
  columns: DbColumn[];
  primaryKey: string;
  tables: string[];
  githubDb: GithubDbType | null;
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
