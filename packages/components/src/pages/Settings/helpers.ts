import { Github, types } from '@db-man/github';
import { message } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';

import * as constants from '../../constants';
import { errMsg } from '../../utils';

const loadDbsSchemaAsync = async (github: any, repoPath: string) => {
  // Get all db names in root dir, db name is sub dir name
  // e.g. files=[{name: 'iam'}]
  const files: types.FileOrDir[] = await github.getContentByPath(repoPath);

  const dbsSchema: types.DatabaseMap = {
    /**
     * key must be:
     * - Top Nav title name
     * - Folder name in https://github.com/{user_name}/{repo_name}/tree/main/{path}
     */
    // iam: {name: 'iam', description: 'iam desc', tables: [{ name: "users", columns: [] }]},
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
            const databaseSchema: types.DatabaseSchema = res.content;
            dbsSchema[dbName] = databaseSchema;
          })
          .catch((err: unknown) => {
            if (
              err &&
              typeof err === 'object' &&
              'cause' in err &&
              typeof err.cause === 'object' &&
              err.cause &&
              'status' in err.cause &&
              err.cause.status === 404
            ) {
              throw new Error(
                `Database config file ${constants.DB_CFG_FILENAME} not found for database "${dbName}"`
              );
            }
            throw err;
          });
      })
  );

  return dbsSchema;
};

const validateDbsSchame = (dbsSchema: types.DatabaseMap) => {
  const errors: string[] = [];
  Object.keys(dbsSchema).forEach((dbName) => {
    const dbSchema = dbsSchema[dbName];
    if (!dbSchema.name) {
      errors.push(`Missing database name, dbName:${dbName}`);
    }
    if (!dbSchema.description) {
      errors.push(`Missing database description, dbName:${dbName}`);
    }
    const tables = dbSchema.tables;
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

export const saveConnectionToLocalStorage = (
  token: string,
  owner: string,
  repo: string
) => {
  // Set db connection info
  localStorage.setItem(constants.LS_KEY_GITHUB_OWNER, owner);
  localStorage.setItem(constants.LS_KEY_GITHUB_REPO_NAME, repo);
  localStorage.setItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN, token);
};

export const reloadDbsSchemaAsync = async (
  token: string,
  owner: string,
  repoName: string,
  messageApi: MessageInstance
) => {
  messageApi.info('Start loading DBs schema...');

  const github = new Github({
    personalAccessToken: token,
    owner,
    repoName,
  });

  let res;
  try {
    // get repo path from dbs.json in repo root dir
    // in this file will tell where to find all db files
    // TODO: test this with non split-table mode
    res = await github.getDbsCfg();
  } catch (err) {
    errMsg(
      `Failed to get dbs.json! Reason: ${
        err instanceof Error ? err.message : 'Unknown error'
      }.`
    );
    return;
  }

  const repoPath = res.content.repoPath;
  if (!repoPath) {
    errMsg('Repo path not found in dbs.json!');
    return;
  }
  localStorage.setItem(constants.LS_KEY_GITHUB_REPO_PATH, repoPath);

  const dbModes = res.content.dbModes;
  if (!dbModes) {
    errMsg('DB modes not found in dbs.json!');
    return;
  }
  localStorage.setItem(constants.LS_KEY_GITHUB_REPO_MODES, dbModes);

  let dbsSchema;
  try {
    dbsSchema = await loadDbsSchemaAsync(github, repoPath);
  } catch (err) {
    errMsg(
      `Failed to get DB schema! ${
        err instanceof Error ? err.message : 'Unknown error'
      }.`,
      err as Error
    );
    return;
  }

  if (!validateDbsSchame(dbsSchema)) {
    messageApi.error('DB schema is invalid! Will not save to localStorage!');
    return;
  }

  localStorage.setItem(constants.LS_KEY_DBS_SCHEMA, JSON.stringify(dbsSchema));

  messageApi.info('Finish loading DBs schema! Will reload window in 3s!');
  setTimeout(() => {
    window.location.reload();
  }, 3000);
};
