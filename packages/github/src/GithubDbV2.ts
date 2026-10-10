import { Base64 } from 'js-base64';

import {
  DatabaseMap,
  DatabaseSchema,
  UpdateFileType,
  DbTable,
  FileOrDir,
  PrimaryKeyVal,
} from './types';
import { DB_CFG_FILENAME } from './constants';
import {
  getDataFileName,
  getInsightsFileName,
  getRecordFileName,
} from './utils';
import GithubV2 from './GithubV2';

/**
 * What an entry of a directory listing really carries. `listDir()` declares
 * `FileOrDir[]`, which only names `name`; the entries GitHub returns for a dir
 * also carry the `sha` that `getTableRows()` needs to reach the blob API.
 */
type DirEntry = FileOrDir & { sha: string };

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
 * const githubDb = new GithubDbV2({
 *   personalAccessToken
 *   repoPath: 'dbs',
 *   dbsSchema,
 *   owner: 'ownerName',
 *   repoName: 'repoName',
 * });
 * ```
 */
export default class GithubDbV2 {
  LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN: string;

  LS_KEY_GITHUB_REPO_PATH: string; // e.g. dbs

  LS_KEY_GITHUB_OWNER: string;

  LS_KEY_GITHUB_REPO_NAME: string;

  dbsSchema: DatabaseMap;

  githubV2: GithubV2;

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

    this.githubV2 = new GithubV2({
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
   * @returns Path for GitHub, e.g. dbs/iam/users/1.json
   */
  getRowPath(dbName, tableName, primaryKeyVal: PrimaryKeyVal) {
    return `${
      this.LS_KEY_GITHUB_REPO_PATH
    }/${dbName}/${tableName}/${getRecordFileName(primaryKeyVal)}`;
  }

  /**
   * @returns Path for GitHub, e.g. dbs/dbName/__views__/viewName.js
   */
  getDbViewScriptPath(dbName: string, queryFilename: string) {
    return `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}/__views__/${queryFilename}`;
  }

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @returns Path for GitHub, e.g. dbs/dbName/tableName.data.json
   */
  getTableDataPath(dbName, tableName) {
    return `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}/${getDataFileName(
      tableName, // eslint-disable-line @typescript-eslint/comma-dangle
    )}`;
  }

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @returns Path for GitHub, e.g. dbs/dbName/tableName.insights.json
   */
  getInsightsPath(dbName, tableName) {
    return `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}/${getInsightsFileName(
      tableName,
    )}`;
  }

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @returns GitHub URL of table data file, e.g. https://github.com/ownerName/repoName/blob/main/dbs/dbName/tableName.data.json
   */
  getTableDataUrl(dbName, tableName) {
    return this.getGitHubFullPath(this.getTableDataPath(dbName, tableName));
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
   * When table file is more than 1MB, list the db dir with listDir to get sha, and then using sha to call getBlobContentAndSha to get content
   * When table file is less than 1MB, call getFileContentAndSha
   * @param {string} path
   * @param {string} dbName
   * @param {string} tableName
   * @param {new AbortController().signal} signal
   * @returns {Promise}
   */
  async getTableRows(dbName: string, tableName: string, signal?: AbortSignal) {
    if (!this.isLargeTable(dbName, tableName)) {
      return this.githubV2.getFileContentAndSha(
        this.getTableDataPath(dbName, tableName),
        signal, // eslint-disable-line @typescript-eslint/comma-dangle
      );
    }

    const dirPath = `${this.LS_KEY_GITHUB_REPO_PATH}/${dbName}`;
    // listDir owns the "this path must be a dir" rule, so there is no shape
    // check to repeat here.
    const files = (await this.githubV2.listDir(
      dirPath,
      signal, // eslint-disable-line @typescript-eslint/comma-dangle
    )) as DirEntry[];

    let sha;
    files.forEach((file) => {
      if (file.name === getDataFileName(tableName)) {
        sha = file.sha;
      }
    });
    return this.githubV2.getBlobContentAndSha(sha, signal);
  }

  /**
   * Get the git log for insights
   */
  async getTableInsights(
    dbName: string,
    tableName: string,
    signal?: AbortSignal,
  ) {
    return this.githubV2
      .getFileRawContent(this.getInsightsPath(dbName, tableName), signal)
      .then((data) => {
        // when data has no content in it, this is not expected in getTableInsights (but no idea why this happens)
        if (!('content' in data) || !data.content) {
          throw new Error(
            'getTableInsights failed, res.content is not in res, check the path param.',
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
   * @param {string} dbName
   * @param {string} tableName
   * @param {string|number} primaryKeyVal
   * @param {new AbortController().signal} signal
   * @returns {Promise}
   */
  getRowFileContentAndSha(
    dbName: string,
    tableName: string,
    primaryKeyVal: PrimaryKeyVal,
    signal?: AbortSignal,
  ) {
    const path = this.getRowPath(dbName, tableName, primaryKeyVal);
    return this.githubV2.getFileContentAndSha(path, signal);
  }

  /**
   * @param {string} dbName
   * @param {string} queryFilename
   * @param {new AbortController().signal} signal
   * @returns {Promise}
   */
  getDbViewScriptFileContentAndSha(
    dbName: string,
    queryFilename: string,
    signal?: AbortSignal,
  ) {
    const path = this.getDbViewScriptPath(dbName, queryFilename);
    return this.githubV2.getPlainTextByPath(path, signal);
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
    sha: UpdateFileType['sha'],
  ) {
    const path = this.getTableDataPath(dbName, tableName);
    const params = {
      path,
      content: JSON.stringify(content, null, 1),
      message: `[db-man] Update table file (${dbName}/${tableName})`,
    };
    // A sha means "overwrite the revision I read", no sha means "create". The
    // library keeps those behind two entries now, so the caller's optional sha
    // is what picks one.
    if (sha === undefined || sha === null) {
      return this.githubV2.createFile(params);
    }
    return this.githubV2.saveFile({ ...params, sha });
  }

  /**
   * Create a row file: `dbs/<dbName>/<tableName>/<primaryKeyVal>.json`.
   *
   * There is no sha parameter on purpose. A caller that has not read the file
   * has nothing to overwrite, and the entry for that job is createFile().
   * `primaryKeyName` is the column to take the file name from, not a value.
   *
   * @returns {Promise<Response>} response.commit.html_url points at the commit
   */
  async createRow(dbName, tableName, primaryKeyName, row) {
    return this.githubV2.createFile({
      ...this.getRowWriteParams(dbName, tableName, primaryKeyName, row),
      message: `[db-man] Create record file (${dbName}/${tableName})`,
    });
  }

  /**
   * Overwrite the revision the caller read, addressed by that revision's sha.
   *
   * The sha is required, not optional: "the caller has no sha" is createRow(),
   * and an undefined sha here would silently turn an update into a create.
   *
   * @returns {Promise<Response>} response.commit.html_url points at the commit
   */
  async updateRow(dbName, tableName, primaryKeyName, row, sha: string) {
    return this.githubV2.saveFile({
      ...this.getRowWriteParams(dbName, tableName, primaryKeyName, row),
      message: `[db-man] Update record file (${dbName}/${tableName})`,
      sha,
    });
  }

  /**
   * Both entries write the same bytes to the same place, so the path rule and
   * the on-disk formatting (2 spaces) are stated once, here. Only the message
   * and the create-vs-overwrite choice differ between them.
   */
  private getRowWriteParams(dbName, tableName, primaryKeyName, row) {
    return {
      path: this.getRowPath(dbName, tableName, row[primaryKeyName]),
      content: JSON.stringify(row, null, '  '),
    };
  }

  // Schema management

  /**
   * @param {Object} dbConfig JSON object of database config `dbcfg.json`
   * @return {Promise<Response>}
   */
  async createDatabaseSchema(databaseSchema: DatabaseSchema) {
    const databaseName = databaseSchema.name;
    return this.githubV2.createFile({
      path: this.getDbConfigPath(databaseName),
      content: JSON.stringify(databaseSchema, null, '  '),
      message: `[db-man] Create database schema (${databaseName})`,
    });
  }

  async updateDatabaseSchema(databaseSchema: DatabaseSchema, sha: string) {
    const databaseName = databaseSchema.name;
    return this.githubV2.saveFile({
      path: this.getDbConfigPath(databaseName),
      content: JSON.stringify(databaseSchema, null, '  '),
      message: `[db-man] Update database schema (${databaseName})`,
      sha,
    });
  }

  // Append a new table schema to dbcfg.json
  async createTableSchema(dbName: string, tableConfig: DbTable) {
    const { obj, sha } = await this.getDbTablesSchemaV2(dbName);
    const newObj = {
      ...obj,
      tables: [...obj.tables, tableConfig],
    };
    return this.githubV2.saveFile({
      path: this.getDbConfigPath(dbName),
      content: JSON.stringify(newObj, null, '  '),
      message: `[db-man] Create table schema (${tableConfig.name})`,
      sha,
    });
  }

  async getDbTablesSchema(dbName: string) {
    const { content } = await this.githubV2.getFileContentAndSha(
      this.getDbConfigPath(dbName),
    );
    return content;
  }

  // Get one db schema from dbcfg.json
  async getDbTablesSchemaV2(dbName: string) {
    const { content, sha } = await this.githubV2.getFileRawContent(
      this.getDbConfigPath(dbName),
    );

    // when no content in dbcfg.json, this is not expected
    if (!content) {
      throw new Error(
        'getDbTablesSchemaV2Async failed, file content is empty.',
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
  async deleteRow(dbName, tableName, primaryKeyVal, sha) {
    const path = this.getRowPath(dbName, tableName, primaryKeyVal);
    return this.githubV2.deleteFile({
      path,
      sha,
      message: `[db-man] Delete file (${dbName}/${tableName})`,
    });
  }
}
