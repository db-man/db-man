import { LS_KEY_DBS_SCHEMA } from './constants';
// import DbTable from './types/DbTable';

/**
 * DEPRECATED
 *
 * ```json
 * {
 *   "iam": [
 *     {"name": "users", "large": true},
 *     {"name": "roles"}
 *   ]
 * }
 * ```
 */
// export const dbs = JSON.parse(localStorage.getItem(LS_KEY_DBS_SCHEMA) || `{}`);

export const getTablesByDbName = (dbName = '') => {
  const keyVal = localStorage.getItem(LS_KEY_DBS_SCHEMA);
  if (!keyVal) return [];
  const dbs2 = JSON.parse(localStorage.getItem(LS_KEY_DBS_SCHEMA) || `{}`);
  return dbs2[dbName] || [];
};

export const setDbs = (val: string) =>
  localStorage.setItem(LS_KEY_DBS_SCHEMA, val);

// TODO Maybe in @db-man/github
// export const getTable = (dbName: string, tableName: string) => {
//   if (!dbs) return null;
//   return dbs[dbName].find(({ name }: DbTable) => name === tableName);
// };

// TODO Maybe in @db-man/github
// export const isLargeTable = (dbName: string, tableName: string) => {
//   const table = getTable(dbName, tableName);
//   if (!table) return false;
//   return table.large;
// };
