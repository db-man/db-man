import { LS_KEY_DBS_SCHEMA } from './constants';

/**
 * ```json
 * {
 *   "iam": [
 *     {"name": "users", "large": true},
 *     {"name": "roles"}
 *   ]
 * }
 * ```
 */
export const dbs = JSON.parse(localStorage.getItem(LS_KEY_DBS_SCHEMA));

export const getDbs = () => JSON.parse(localStorage.getItem(LS_KEY_DBS_SCHEMA));
export const getTablesByDbName = (dbName) => {
  const keyVal = localStorage.getItem(LS_KEY_DBS_SCHEMA);
  if (!keyVal) return [];
  const dbs2 = JSON.parse(localStorage.getItem(LS_KEY_DBS_SCHEMA));
  return dbs2[dbName] || [];
};

export const setDbs = (val) => (localStorage.setItem(LS_KEY_DBS_SCHEMA, val));

export const getTable = (dbName, tableName) => {
  if (!dbs) return null;
  return dbs[dbName].find(({ name }) => name === tableName);
};

export const isLargeTable = (dbName, tableName) => {
  const table = getTable(dbName, tableName);
  if (!table) return false;
  return table.large;
};
