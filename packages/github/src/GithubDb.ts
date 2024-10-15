import { DatabaseMap } from './types';
import { getDataFileName, getRecordFileName } from './utils';
import Github from './Github';

const DB_CFG_FILENAME = 'dbcfg.json';

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
 *  "iam": [
 *     {
 *       "name": "users",
 *       "large": false
 *     }
 *   ]
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

  dbs: DatabaseMap;

  github: Github;

  constructor({
    personalAccessToken,
    repoPath,
    dbsSchema,
    owner,
    repoName,
  }: {
    personalAccessToken: string;
    repoPath: string;
    dbsSchema: string;
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
    this.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN = personalAccessToken;
    this.LS_KEY_GITHUB_REPO_PATH = repoPath;
    this.LS_KEY_GITHUB_OWNER = owner;
    this.LS_KEY_GITHUB_REPO_NAME = repoName;
    this.dbs = JSON.parse(dbsSchema);

    this.github = new Github({
      personalAccessToken: this.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN,
      owner: this.LS_KEY_GITHUB_OWNER,
      repoName: this.LS_KEY_GITHUB_REPO_NAME,
    });
  }

  /**
   *
   * @param {string} path e.g. dbsDir/dbName/tableName.data.json
   * @returns
   */
  getGitHubFullPath(path) {
    return `https://github.com/${this.LS_KEY_GITHUB_OWNER}/${this.LS_KEY_GITHUB_REPO_NAME}/blob/main/${path}`;
  }

  getGitHubHistoryPath(path) {
    return `https://github.com/${this.LS_KEY_GITHUB_OWNER}/${this.LS_KEY_GITHUB_REPO_NAME}/commits/main/${path}`;
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
   * @returns GitHub URL of table data file, e.g. https://github.com/ownerName/repoName/blob/main/dbs/dbName/tableName.data.json
   */
  getDataUrl(dbName, tableName) {
    return this.getGitHubFullPath(this.getDataPath(dbName, tableName));
  }

  /**
   * @return {string} e.g. "dbs/dbName/dbcfg.json"
   * @private
   */
  getDbTableColDefPath(dbName) {
    return `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}/${DB_CFG_FILENAME}`;
  }

  async getDbTablesSchemaAsync(dbName) {
    const { content } = await this.github.getFileContentAndSha(
      this.getDbTableColDefPath(dbName)
    );
    return content;
  }

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @returns {Object|null} Returns null when table not found
   */
  getTable(dbName, tableName) {
    if (!this.dbs || !this.dbs[dbName]) {
      throw new Error('this.dbs is invalid!');
    }
    return this.dbs[dbName].tables.find(({ name }) => name === tableName);
  }

  isLargeTable(dbName, tableName) {
    const table = this.getTable(dbName, tableName);
    if (!table) return false;
    return table.large;
  }

  /**
   * When table file is more than 1MB, call getPath and then getBlobContentAndSha
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

    const files = await this.github.getPath(
      `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}`,
      signal // eslint-disable-line @typescript-eslint/comma-dangle
    );

    // when calling getPath with a file as path param, it returns an object instead of an array
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
   * @param {string} path
   * @param {string} dbName
   * @param {string} tableName
   * @param {new AbortController().signal} signal
   * @returns {Promise}
   */
  getRecordFileContentAndSha(dbName, tableName, primaryKeyVal, signal) {
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
  async updateTableFile(dbName, tableName, content, sha) {
    const path = this.getDataPath(dbName, tableName);
    return this.github.updateFile(
      path,
      JSON.stringify(content, null, 1),
      sha,
      'Update table file' // eslint-disable-line @typescript-eslint/comma-dangle
    );
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
    return this.github.updateFile(
      path,
      JSON.stringify(record, null, '  '),
      sha,
      'Update record file' // eslint-disable-line @typescript-eslint/comma-dangle
    );
  }

  /**
   * @return {Promise<Response>}
   * response.commit
   * response.commit.html_url https://github.com/username/reponame/commit/a7f...04d
   * response.content
   */
  async deleteRecordFile(dbName, tableName, primaryKeyVal, sha) {
    const path = this.getRecordPath(dbName, tableName, primaryKeyVal);
    return this.github.deleteFile(path, sha);
  }
}
