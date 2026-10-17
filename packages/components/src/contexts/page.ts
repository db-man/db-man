import React from 'react';

import { types, GithubDbV2 } from '@db-man/github';

import DbColumn from '../types/DbColumn';
import DbTable from '../types/DbTable';
// import { GithubDbType } from './commonPage';

export interface PageContextType {
  appModes: string[];
  dbs?: types.DatabaseMap;
  dbName: string;
  tableName: string;
  action: string;
  columns: DbColumn[];
  primaryKey: string;
  tables: DbTable[];
  githubDbV2: GithubDbV2 | null;
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
  githubDbV2: null, // GithubDbV2 from @db-man/github
});

export default PageContext;
