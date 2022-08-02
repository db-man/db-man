import { github, githubDb } from '@db-man/github';
import { message } from 'antd';
import * as constants from '../constants';
import { errMsg } from '../utils';

const loadDbsSchemaAsync = async (path) => {
  // Get all db names in root dir, db name is sub dir name
  const files = await github.getFile(path);

  const dbsSchema = {
    /**
     * key must be:
     * - Top Nav title name
     * - Folder name in https://github.com/{user_name}/{repo_name}/tree/main/{path}
     */
    // dbName: [{ name: "table_name", columns: [] }]
  };

  // Loop get all table schema
  await Promise.all(
    files
      .map(({ name }) => name)
      .map((dbName) => githubDb.getDbTablesSchemaAsync(dbName).then((tables) => {
        dbsSchema[dbName] = tables;
      })),
  );

  return dbsSchema;
};

const validateDbsSchame = (dbsSchema) => {
  Object.keys(dbsSchema).forEach((dbName) => {
    const tables = dbsSchema[dbName];
    tables.forEach((table, index) => {
      if (!table.name) {
        message.warn(`Missing table name, dbName:${dbName}, index:${index}`, 10);
      }
      if (!table.columns) {
        message.warn(`Missing table columns, tableName: ${table.name}, dbName:${dbName}`, 10);
      }
    });
  });
};

const reloadDbsSchemaAsync = async () => {
  message.info('Start loading DBs schema...');

  const path = localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH);
  if (!path) {
    errMsg('Repo path not found in localStorage!');
    return;
  }

  let dbsSchema;
  try {
    dbsSchema = await loadDbsSchemaAsync(path);
  } catch (err) {
    errMsg(`Failed to get DB schema! Maybe you need to create this file: https://github.com/${localStorage.getItem(constants.LS_KEY_GITHUB_OWNER)}/${localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME)}/${path}`, err);
    return;
  }

  validateDbsSchame(dbsSchema);

  localStorage.setItem(constants.LS_KEY_DBS_SCHEMA, JSON.stringify(dbsSchema));

  message.info('Finish loading DBs schema! Will reload window in 3s!');

  setTimeout(() => {
    window.location.reload();
  }, 3000);
};

export default reloadDbsSchemaAsync;
