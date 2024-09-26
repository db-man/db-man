import { message } from 'antd';

import * as constants from '../constants';
import { errMsg } from '../utils';
import DbTable from '../types/DbTable';
import Databases from '../types/Databases';

// TODO this type should be from @octokit/rest
type FileOrDir = {
  name: string;
};

const loadDbsSchemaAsync = async (github: any, repoPath: string) => {
  // Get all db names in root dir, db name is sub dir name
  // e.g. files=[{name: 'iam'}]
  const files: FileOrDir[] = await github.getPath(repoPath);

  const dbsSchema: Databases = {
    /**
     * key must be:
     * - Top Nav title name
     * - Folder name in https://github.com/{user_name}/{repo_name}/tree/main/{path}
     */
    // iam: [{ name: "users", columns: [] }]
  };

  // Loop get all table schema
  await Promise.all(
    files
      .map(({ name }: { name: string }) => name)
      .map((dbName: string) => {
        return github
          .getFileContentAndSha(
            `${repoPath}/${dbName}/${constants.DB_CFG_FILENAME}`
          )
          .then((res: any) => {
            const tables: DbTable[] = res.content;
            dbsSchema[dbName] = tables;
          });
      })
  );

  return dbsSchema;
};

const validateDbsSchame = (dbsSchema: Databases) => {
  const errors: string[] = [];
  Object.keys(dbsSchema).forEach((dbName) => {
    const tables = dbsSchema[dbName];
    tables.forEach((table, index) => {
      if (!table.name) {
        errors.push(`Missing table name, dbName:${dbName}, index:${index}`);
      }
      if (!table.columns) {
        errors.push(
          `Missing table columns, tableName: ${table.name}, dbName:${dbName}`
        );
      }
      table.columns.forEach((column, colIndex) => {
        if (!column.id) {
          errors.push(
            `Missing column id, tableName: ${table.name}, dbName:${dbName}, colIndex:${colIndex}`
          );
        }
        if (!column.name) {
          errors.push(
            `Missing column name, tableName: ${table.name}, dbName:${dbName}, colIndex:${colIndex}`
          );
        }
        if (!column.type) {
          errors.push(
            `Missing column type, tableName: ${table.name}, dbName:${dbName}, colIndex:${colIndex}`
          );
        }
      });
    });
  });

  if (errors.length) {
    message.warning(errors.join('\n'), 20);
  }

  return errors.length === 0;
};

const reloadDbsSchemaAsync = async (github: any) => {
  message.info('Start loading DBs schema...');

  const repoPath = localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH);
  if (!repoPath) {
    errMsg('Repo path not found in localStorage!');
    return;
  }

  let dbsSchema;
  try {
    dbsSchema = await loadDbsSchemaAsync(github, repoPath);
  } catch (err) {
    errMsg(
      `Failed to get DB schema! Maybe you need to create this file: https://github.com/${localStorage.getItem(
        constants.LS_KEY_GITHUB_OWNER
      )}/${localStorage.getItem(
        constants.LS_KEY_GITHUB_REPO_NAME
      )}/${repoPath}`,
      err as Error
    );
    return;
  }

  if (!validateDbsSchame(dbsSchema)) {
    message.error('DB schema is invalid! Will not save to localStorage!');
    return;
  }

  localStorage.setItem(constants.LS_KEY_DBS_SCHEMA, JSON.stringify(dbsSchema));
  message.info('Finish loading DBs schema! Will reload window in 3s!');
  setTimeout(() => {
    window.location.reload();
  }, 3000);
};

export default reloadDbsSchemaAsync;
