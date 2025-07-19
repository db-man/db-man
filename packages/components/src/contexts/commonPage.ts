import React from 'react';

import { GithubDb } from '@db-man/github';

// TODO: Already used GithubDb from @db-man/github as the ts type, so better to remove this type (need to search all places where using `GithubDbType` also need to remove)
// // TODO: move this to @db-man/github
// export interface GithubDbType {
//   getTableRows: (
//     dbName: string,
//     tableName: string,
//     signal?: AbortSignal
//   ) => Promise<{ content: RowType[]; sha: string }>;
//   getTableInsights: (
//     dbName: string,
//     tableName: string,
//     signal?: AbortSignal
//   ) => Promise<string>;
//   updateTableFile: (
//     dbName: string,
//     tableName: string,
//     content: RowType[],
//     tableFileSha: types.UpdateFileType['sha']
//   ) => Promise<{
//     commit: {
//       html_url?: string;
//     };
//   }>;
//   // updateTableFile: any;
//   updateRecordFile: (
//     dbName: string,
//     tableName: string,
//     recordId: string,
//     content: RowType,
//     recordFileSha: string | null
//   ) => Promise<{
//     commit: {
//       html_url?: string;
//     };
//   }>;
//   createDatabase: (dbConfig: types.DatabaseSchema) => Promise<{
//     commit: {
//       html_url?: string;
//     };
//   }>;
//   createTableSchema: (tableConfig: types.DbTable) => Promise<{
//     commit: {
//       html_url?: string;
//     };
//   }>;
//   getDataUrl: (dbName: string, tableName: string) => string;
//   getRecordFileContentAndSha: (
//     dbName: string,
//     tableName: string,
//     recordId: string,
//     signal?: AbortSignal
//   ) => Promise<{ content: RowType; sha: string }>;
//   getGitHubRepoPath: () => string;
//   getGitHubFullPath: (path: string) => string;
//   getDataPath: (dbName: string, tableName: string) => string;
//   deleteRecordFile: (
//     dbName: string,
//     tableName: string,
//     recordId: string,
//     recordFileSha: string | null
//   ) => Promise<{
//     commit: {
//       html_url?: string;
//     };
//   }>;
// }

export interface CommonPageContextType {
  appModes: string[];
  // githubDb: GithubDbType | null;
  githubDb: GithubDb | null;
}

// Store all page info, include db, table, and columns
// Setter: src/layout/DbTablePage.tsx
const CommonPageContext = React.createContext<CommonPageContextType>({
  appModes: [], // all db modes: 'split-table'
  githubDb: null, // GitHubDb from @db-man/github
});

export default CommonPageContext;
