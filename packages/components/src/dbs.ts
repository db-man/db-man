import { types } from '@db-man/github';

import { LS_KEY_DBS_SCHEMA } from './constants';
import DbTable from './types/DbTable';
import DbColumn from './types/DbColumn';

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

export const getColumns = ({
  dbName,
  tableName,
}: {
  dbName?: string;
  tableName?: string;
}) => {
  const tablesOfSelectedDb = getTablesByDbName(dbName);
  if (!tablesOfSelectedDb) return [];
  const currentTable = tablesOfSelectedDb.find(
    (table: DbTable) => table.name === tableName
  );
  if (!currentTable) return [];
  return currentTable.columns;
};

/**
 *
 * @param {*} columns
 * @returns {string}
 */
export const getPrimaryKey = (columns: DbColumn[]) => {
  const foundCol = columns.find((col) => col.primary);
  return foundCol ? foundCol.id : '';
};

export const getTablePrimaryKey = (
  tables: types.DbTable[],
  tableName: string
) => {
  const foundTable = tables.find((table) => table.name === tableName);
  if (!foundTable) {
    return '';
  }

  return getPrimaryKey(foundTable.columns);
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
