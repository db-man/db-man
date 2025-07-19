import { Base64 } from 'js-base64';

import { DatabaseMap, DatabaseSchema, UpdateFileType, DbTable } from './types';
import { DB_CFG_FILENAME } from './constants';
import {
  getDataFileName,
  getInsightsFileName,
  getRecordFileName,
} from './utils';
import Github from './Github';

/**
 * @class
 * @param {string} personalAccessToken
 * @param {string} repoPath
 * @param {string} dbsSchema
 * @param {string} owner
 * @param {string} repoName
 * @example
 * ```js
 * const dbsSchema = {
 *  "iam": {
 *     "name": "iam",
 *     "description": "iam db",
 *     tables: [
 *       {
 *         "name": "users",
 *         "large": false
 *       }
 *     ]
 *   }
 * };
 * const githubDb = new GithubDb({
 *   personalAccessToken
 *   repoPath: 'dbs',
 *   dbsSchema,
 *   owner: 'ownerName',
 *   repoName: 'repoName',
 * });
 * ```
 */
export default class GithubDb {
  LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN: string;

  LS_KEY_GITHUB_REPO_PATH: string;

  LS_KEY_GITHUB_OWNER: string;

  LS_KEY_GITHUB_REPO_NAME: string;

  dbsSchema: DatabaseMap;

  github: Github;

  /**
   * Cache dbsSchema in this class, so that we don't need to get it from GitHub API every time
   */
  constructor({
    personalAccessToken,
    repoPath,
    dbsSchema,
    owner,
    repoName,
  }: {
    personalAccessToken: string;
    repoPath: string;
    dbsSchema: DatabaseMap;
    owner: string;
    repoName: string;
  }) {
    if (personalAccessToken === undefined || personalAccessToken === null) {
      throw new Error('Input personalAccessToken is undefined or null!');
    }
    if (!repoPath) {
      throw new Error('Input repoPath is invalid!');
    }
    if (!dbsSchema) {
      throw new Error('Input dbsSchema is invalid!');
    }
    if (!owner) {
      throw new Error('Input owner is invalid!');
    }
    if (!repoName) {
      throw new Error('Input repoName is invalid!');
    }
    // TODO: can put all these keys into a single object, like `context` in GitHub.ts
    this.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN = personalAccessToken;
    this.LS_KEY_GITHUB_REPO_PATH = repoPath;
    this.LS_KEY_GITHUB_OWNER = owner;
    this.LS_KEY_GITHUB_REPO_NAME = repoName;
    this.dbsSchema = dbsSchema;

    this.github = new Github({
      personalAccessToken: this.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN,
      owner: this.LS_KEY_GITHUB_OWNER,
      repoName: this.LS_KEY_GITHUB_REPO_NAME,
    });
  }

  /**
   * Get the GitHub repo path
   * @returns
   */
  getGitHubRepoPath() {
    return `https://github.com/${this.LS_KEY_GITHUB_OWNER}/${this.LS_KEY_GITHUB_REPO_NAME}`;
  }

  /**
   *
   * @param {string} path e.g. dbsDir/dbName/tableName.data.json
   * @returns
   */
  getGitHubFullPath(path: string) {
    return `https://github.com/${this.LS_KEY_GITHUB_OWNER}/${this.LS_KEY_GITHUB_REPO_NAME}/blob/main/${path}`;
  }

  getGitHubHistoryPath(path: string) {
    return `https://github.com/${this.LS_KEY_GITHUB_OWNER}/${this.LS_KEY_GITHUB_REPO_NAME}/commits/main/${path}`;
  }

  /**
   * @param {string} dbName
   * @returns Path for GitHub, e.g. dbs/dbName/dbcfg.json
   */
  getDbConfigPath(dbName: string) {
    return `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}/${DB_CFG_FILENAME}`;
  }

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @param {string|number} primaryKeyVal
   * @returns Path for GitHub
   */
  getRecordPath(dbName, tableName, primaryKeyVal: string | number) {
    return `${
      this.LS_KEY_GITHUB_REPO_PATH
    }/${dbName}/${tableName}/${getRecordFileName(primaryKeyVal)}`;
  }

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @returns Path for GitHub, e.g. dbs/dbName/tableName.data.json
   */
  getDataPath(dbName, tableName) {
    return `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}/${getDataFileName(
      tableName // eslint-disable-line @typescript-eslint/comma-dangle
    )}`;
  }

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @returns Path for GitHub, e.g. dbs/dbName/tableName.insights.json
   */
  getInsightsPath(dbName, tableName) {
    return `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}/${getInsightsFileName(
      tableName
    )}`;
  }

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @returns GitHub URL of table data file, e.g. https://github.com/ownerName/repoName/blob/main/dbs/dbName/tableName.data.json
   */
  getDataUrl(dbName, tableName) {
    return this.getGitHubFullPath(this.getDataPath(dbName, tableName));
  }

  /**
   * Get table schema from dbSchema
   * Returns null when table not found
   */
  getTableSchema(dbName: string, tableName: string) {
    if (!this.dbsSchema || !this.dbsSchema[dbName]) {
      throw new Error('this.dbsSchema is invalid!');
    }
    return this.dbsSchema[dbName].tables.find(({ name }) => name === tableName);
  }

  isLargeTable(dbName: string, tableName: string) {
    const table = this.getTableSchema(dbName, tableName);
    if (!table) return false;
    return table.large;
  }

  /**
   * When table file is more than 1MB, call getContentByPath to get sha, and then using sha to call getBlobContentAndSha to get content
   * When table file is less than 1MB, call getFileContentAndSha
   * @param {string} path
   * @param {string} dbName
   * @param {string} tableName
   * @param {new AbortController().signal} signal
   * @returns {Promise}
   */
  async getTableRows(dbName: string, tableName: string, signal?: AbortSignal) {
    if (!this.isLargeTable(dbName, tableName)) {
      return this.github.getFileContentAndSha(
        this.getDataPath(dbName, tableName),
        signal // eslint-disable-line @typescript-eslint/comma-dangle
      );
    }

    const files = await this.github.getContentByPath(
      `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}`,
      signal // eslint-disable-line @typescript-eslint/comma-dangle
    );

    // when calling getContentByPath with a file as path param, it returns an object instead of an array
    if (!Array.isArray(files)) {
      throw new Error(
        `getTableRows: Expected an array of files for the path "${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}", but received an object. Please check if the provided path is a directory.` // eslint-disable-line @typescript-eslint/comma-dangle
      );
    }

    let sha;
    files.forEach((file) => {
      if (file.name === getDataFileName(tableName)) {
        sha = file.sha;
      }
    });
    return this.github.getBlobContentAndSha(sha, signal);
  }

  /**
   * Get the git log for insights
   */
  async getTableInsights(
    dbName: string,
    tableName: string,
    signal?: AbortSignal
  ) {
    return this.github
      .getContentByPath(this.getInsightsPath(dbName, tableName), signal)
      .then((data) => {
        // when path is a dir, data is an array, this is not expected in getTableInsights
        if (Array.isArray(data)) {
          throw new Error(
            'getTableInsights failed, res is an array, the path param should be a file, not a dir.'
          );
        }
        // when data is not array, but no content in it, this is not expected in getTableInsights (but no idea why this happens)
        if (!('content' in data) || !data.content) {
          throw new Error(
            'getTableInsights failed, res.content is not in res, check the path param.'
          );
        }
        if (data.content === '') {
          // This is a new empty file, maybe just created
          return '';
        } else {
          const ret = Base64.decode(data.content);
          console.debug('@db-man/github getTableInsights ret:', ret);
          return ret;
        }
      });
  }

  /**
   * @param {string} path
   * @param {string} dbName
   * @param {string} tableName
   * @param {new AbortController().signal} signal
   * @returns {Promise}
   */
  getRecordFileContentAndSha(
    dbName: string,
    tableName: string,
    primaryKeyVal: string,
    signal?: AbortSignal
  ) {
    const path = this.getRecordPath(dbName, tableName, primaryKeyVal);
    return this.github.getFileContentAndSha(path, signal);
  }

  /**
   * @param {Object} content File content in JSON object
   * @return {Promise<Response>}
   * response.commit
   * response.commit.html_url https://github.com/username/reponame/commit/a7f...04d
   * response.content
   */
  async updateTableFile(
    dbName: string,
    tableName: string,
    content,
    sha: UpdateFileType['sha']
  ) {
    const path = this.getDataPath(dbName, tableName);
    return this.github.updateFile({
      path,
      content: JSON.stringify(content, null, 1),
      sha,
      message: `[db-man] Update table file (${dbName}/${tableName})`,
    });
  }

  /**
   * @param {Object} content File content in JSON object
   * @return {Promise<Response>}
   * response.commit
   * response.commit.html_url https://github.com/username/reponame/commit/a7f...04d
   * response.content
   */
  async updateRecordFile(dbName, tableName, primaryKey, record, sha) {
    const path = this.getRecordPath(dbName, tableName, record[primaryKey]);
    return this.github.updateFile({
      path,
      content: JSON.stringify(record, null, '  '),
      sha,
      message: `[db-man] Update record file (${dbName}/${tableName})`,
    });
  }

  // Schema management

  /**
   * @param {Object} dbConfig JSON object of database config `dbcfg.json`
   * @return {Promise<Response>}
   */
  async createDatabaseSchema(databaseSchema: DatabaseSchema) {
    const databaseName = databaseSchema.name;
    return this.github.updateFile({
      path: this.getDbConfigPath(databaseName),
      content: JSON.stringify(databaseSchema, null, '  '),
      message: `[db-man] Create database schema (${databaseName})`,
      sha: undefined,
    });
  }

  async updateDatabaseSchema(databaseSchema: DatabaseSchema, sha: string) {
    const databaseName = databaseSchema.name;
    return this.github.updateFile({
      path: this.getDbConfigPath(databaseName),
      content: JSON.stringify(databaseSchema, null, '  '),
      message: `[db-man] Update database schema (${databaseName})`,
      sha,
    });
  }

  // Append a new table schema to dbcfg.json
  async createTableSchema(dbName: string, tableConfig: DbTable) {
    const { obj, sha } = await this.getDbTablesSchemaV2Async(dbName);
    const newObj = {
      ...obj,
      tables: [...obj.tables, tableConfig],
    };
    return this.github.updateFile({
      path: this.getDbConfigPath(dbName),
      content: JSON.stringify(newObj, null, '  '),
      message: `[db-man] Create table schema (${tableConfig.name})`,
      sha,
    });
  }

  async getDbTablesSchemaAsync(dbName: string) {
    const { content } = await this.github.getFileContentAndSha(
      this.getDbConfigPath(dbName)
    );
    return content;
  }

  // Get one db schema from dbcfg.json
  async getDbTablesSchemaV2Async(dbName: string) {
    const { content, sha } = await this.github.getContentByPath(
      this.getDbConfigPath(dbName)
    );

    // when no content in dbcfg.json, this is not expected
    if (!content) {
      throw new Error(
        'getDbTablesSchemaV2Async failed, file content is empty.'
      );
    }

    return {
      obj: JSON.parse(Base64.decode(content)),
      sha,
    };
  }

  /**
   * @return {Promise<Response>}
   * response.commit
   * response.commit.html_url https://github.com/username/reponame/commit/a7f...04d
   * response.content
   */
  async deleteRecordFile(dbName, tableName, primaryKeyVal, sha) {
    const path = this.getRecordPath(dbName, tableName, primaryKeyVal);
    return this.github.deleteFile({
      path,
      sha,
      message: `[db-man] Delete file (${dbName}/${tableName})`,
    });
  }
}
