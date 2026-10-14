import { Base64 } from 'js-base64';

import {
  DatabaseMap,
  DatabaseSchema,
  DbColumn,
  DbMode,
  DbTable,
  FileOrDir,
  PrimaryKeyVal,
  RowRev,
  RowWriteAction,
  RowWriteResult,
  TableRow,
  UpdateFileType,
} from './types';
import { DB_CFG_FILENAME } from './constants';
import { createGithubError, isGithubError } from './errors';
import {
  getDataFileName,
  getInsightsFileName,
  getRecordFileName,
  isSamePrimaryKey,
} from './utils';
import GithubV2 from './GithubV2';

/**
 * What an entry of a directory listing really carries. `listDir()` declares
 * `FileOrDir[]`, which only names `name`; the entries GitHub returns for a dir
 * also carry the `sha` that `getTableRows()` needs to reach the blob API.
 */
type DirEntry = FileOrDir & { sha: string };

/**
 * What a `RowRev` carries. The public type is opaque on purpose (see
 * `types.ts`), so these two are the only way in and out, and both are
 * module-private: no caller can mint a revision.
 */
type RowRevPayload = { mode: DbMode; sha: string };

const toRowRev = ({ mode, sha }: RowRevPayload) =>
  ({ mode, sha } as unknown as RowRev);

const fromRowRev = (rev: RowRev) => rev as unknown as RowRevPayload;

/**
 * Attach the two facts a row-level write reports beyond GitHub's own response.
 * Spread rather than wrap: `commit.html_url` has to stay exactly where
 * consumers already read it.
 */
const withWriteInfo = (
  data: any,
  mode: DbMode,
  action: RowWriteAction,
): RowWriteResult => ({ ...data, mode, action });

/**
 * @class
 * @param {string} personalAccessToken
 * @param {string} repoPath
 * @param {string} dbsSchema
 * @param {string} dbModes 'normal' or 'split-table' — where the rows of this
 * database live. Required: the row-level entries below cannot decide it, and
 * guessing a default for it is exactly the kind of inference this library
 * refuses to do. Both it and `dbsSchema` come from the repo's `dbs.json`.
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
 *   dbModes: 'normal',
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

  dbModes: DbMode;

  githubV2: GithubV2;

  /**
   * Cache dbsSchema in this class, so that we don't need to get it from GitHub API every time
   */
  constructor({
    personalAccessToken,
    repoPath,
    dbsSchema,
    dbModes,
    owner,
    repoName,
  }: {
    personalAccessToken: string;
    repoPath: string;
    dbsSchema: DatabaseMap;
    dbModes: DbMode;
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
    if (dbModes !== 'normal' && dbModes !== 'split-table') {
      throw new Error(
        `Input dbModes is invalid, expected 'normal' or 'split-table', got '${String(
          dbModes, // eslint-disable-line @typescript-eslint/comma-dangle
        )}'!`,
      );
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
    this.dbModes = dbModes;

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
   * The column that identifies a row of this table, from `dbsSchema`.
   *
   * Throws when the db is unknown, the table is unknown, or no column carries
   * `primary: true`. All three are schema mistakes that leave a row with no
   * identity, and every entry of the row-level API needs one: it names the
   * record file in split-table mode and is the value the duplicate check
   * compares in normal mode. (`components/src/dbs.ts` answers the last case
   * with the empty string, which then gets used as a file name.)
   */
  getPrimaryKeyColumn(dbName: string, tableName: string): DbColumn {
    const table = this.getTableSchema(dbName, tableName);
    if (!table) {
      throw new Error(
        `Table not found in dbsSchema, dbName: ${dbName}, tableName: ${tableName}.`,
      );
    }
    const column = table.columns.find(({ primary }) => primary);
    if (!column) {
      throw new Error(
        `No column is marked primary: true, dbName: ${dbName}, tableName: ${tableName}.`,
      );
    }
    return column;
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
   * Private: this is the split-table half of `insertRow()`. There is no sha
   * parameter on purpose — a caller that has not read the file has nothing to
   * overwrite, and the entry for that job is `saveRecordFile()`.
   * `primaryKeyName` is the column to take the file name from, not a value.
   *
   * @returns {Promise<Response>} response.commit.html_url points at the commit
   */
  private async createRecordFile(dbName, tableName, primaryKeyName, row) {
    return this.githubV2.createFile({
      ...this.getRowWriteParams(dbName, tableName, primaryKeyName, row),
      message: `[db-man] Create record file (${dbName}/${tableName})`,
    });
  }

  /**
   * Overwrite the revision the caller read, addressed by that revision's sha.
   *
   * Private: this is the split-table half of `updateRow()`. The sha is
   * required, not optional: "the caller has no sha" is `createRecordFile()`,
   * and an undefined sha here would silently turn an update into a create.
   *
   * @returns {Promise<Response>} response.commit.html_url points at the commit
   */
  private async saveRecordFile(dbName, tableName, primaryKeyName, row, sha: string) {
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
   * Delete one record file — the split-table half of `deleteRow()`.
   *
   * @return {Promise<Response>}
   * response.commit
   * response.commit.html_url https://github.com/username/reponame/commit/a7f...04d
   */
  private async deleteRecordFile(dbName, tableName, primaryKeyVal, sha) {
    const path = this.getRowPath(dbName, tableName, primaryKeyVal);
    return this.githubV2.deleteFile({
      path,
      sha,
      message: `[db-man] Delete file (${dbName}/${tableName})`,
    });
  }

  // ---------------------------------------------------------------------------
  // Row-level API.
  //
  // The four entries below are the only place the db mode is looked at: which
  // file a row lives in is decided here, once, and the caller is never told.
  // Every whole-table entry above stays mode-agnostic; the file-level record
  // primitives are private.
  //
  // Design and the reasons behind each rule:
  // docs/plans/2026-10-09-github-api-surface-gaps.md §2.1.
  // ---------------------------------------------------------------------------

  /**
   * Unwrap a revision, and refuse one that belongs to the other storage.
   *
   * A `RowRev` cannot be forged (the public type is opaque) and cannot be
   * mixed up with a table-file sha, but it can still be carried to the wrong
   * database or kept across a mode change. Left unchecked it would be used
   * against a file it does not describe and fail as a 409, far from the cause.
   */
  private readRev(rev: RowRev, dbName: string, tableName: string) {
    const payload = fromRowRev(rev);
    if (payload.mode !== this.dbModes) {
      throw new Error(
        `Row revision was read in '${payload.mode}' mode but this database is '${this.dbModes}', dbName: ${dbName}, tableName: ${tableName}.`,
      );
    }
    return payload;
  }

  /**
   * Read one row, with the revision to write it back with.
   *
   * Returns `null` when the row is not there: "this row does not exist" is an
   * answer to "read this row", not a failure, and it has to read the same in
   * both modes — in split-table the row *is* a file, so a missing file means a
   * missing row, while in normal mode the row is an array member that simply
   * is not found. Only a 404 becomes `null`; 403, a dead token and network
   * failures still throw.
   *
   * A missing *table* file in normal mode still throws for the same reason it
   * is not a row: the table is misconfigured, which is not the same thing.
   *
   * The `rev` is the handle `updateRow()` / `deleteRow()` take back. It is
   * deliberately not produced by `getTableRows()`: that reads
   * `<table>.data.json`, which in split-table mode is a different file from the
   * one a write would touch, so its sha is not the row's version.
   */
  async getRow(
    dbName: string,
    tableName: string,
    primaryKeyVal: PrimaryKeyVal,
    signal?: AbortSignal,
  ): Promise<{ row: TableRow; rev: RowRev } | null> {
    if (this.dbModes === 'split-table') {
      try {
        // The row lives in a file of its own — `dbs/<db>/<table>/<pk>.json`.
        // Which file that is gets decided right here, and no caller is told.
        const path = this.getRowPath(dbName, tableName, primaryKeyVal);
        const { content, sha } = await this.githubV2.getFileContentAndSha(
          path,
          signal,
        );
        // A record file holds one row, though the shape it is read with still
        // says "array" (see the TODO on FileContentAndSha in types.ts).
        return {
          row: content as unknown as TableRow,
          rev: toRowRev({ mode: 'split-table', sha }),
        };
      } catch (err) {
        if (isGithubError(err) && err.type === 'NOT_FOUND') {
          return null;
        }
        throw err;
      }
    }

    const primaryKeyName = this.getPrimaryKeyColumn(dbName, tableName).id;
    const { content, sha } = await this.getTableRows(dbName, tableName, signal);
    const row = content.find((item) =>
      isSamePrimaryKey(item[primaryKeyName], primaryKeyVal),
    );
    if (!row) return null;
    return { row, rev: toRowRev({ mode: 'normal', sha }) };
  }

  /**
   * Add a row.
   *
   * In split-table mode this writes one small record file; in normal mode it
   * downloads the whole table, appends and re-uploads it — a full round trip
   * over the table where the other mode writes a few hundred bytes. The result
   * says which of the two happened (`mode`), so the cost is not hidden.
   *
   * A row whose primary key is already in the table is refused with
   * `DUPLICATE_KEY` in normal mode (found by scanning the array, no HTTP), and
   * with `ALREADY_EXISTS` in split-table mode, where GitHub refuses to create a
   * file that is already there. Those are not the same event: a record file
   * name is sanitized, so two different keys can share one file.
   *
   * There is no `message` parameter: every write in this class commits with a
   * fixed `[db-man] …` message today, and letting the caller leave a trail is
   * its own piece of work (plan §3 Stage 2.2) — not something to settle by
   * widening these four signatures first.
   */
  async insertRow(
    dbName: string,
    tableName: string,
    row: TableRow,
  ): Promise<RowWriteResult> {
    const primaryKeyName = this.getPrimaryKeyColumn(dbName, tableName).id;

    if (this.dbModes === 'split-table') {
      const data = await this.createRecordFile(
        dbName,
        tableName,
        primaryKeyName,
        row,
      );
      return withWriteInfo(data, this.dbModes, 'insert');
    }

    const { content, sha } = await this.getTableRows(dbName, tableName);
    if (
      content.some((item) =>
        isSamePrimaryKey(item[primaryKeyName], row[primaryKeyName]),
      )
    ) {
      throw createGithubError(
        'DUPLICATE_KEY',
        `Failed to insert row, a row with this primary key is already in the table, dbName: ${dbName}, tableName: ${tableName}, primaryKeyName: ${primaryKeyName}.`,
      );
    }
    const data = await this.updateTableFile(
      dbName,
      tableName,
      [...content, row],
      sha,
    );
    return withWriteInfo(data, this.dbModes, 'insert');
  }

  /**
   * Replace one row.
   *
   * Takes the whole row, not a patch: the caller has just read it (it needed
   * `rev` from `getRow()` anyway), and merging a patch is a decision the caller
   * is better placed to make.
   *
   * `rev` must come from `getRow()` for the same row, in the same mode. It is
   * what keeps two writers apart: in normal mode the write carries the sha the
   * caller read, so a whole-table overwrite is refused with `CONFLICT` if
   * anyone changed the table in between. The read below is only there to get
   * the array to splice into — it does not weaken that guard.
   *
   * Changing the primary key is refused rather than half-done: the two modes
   * would not even agree on what it means (split-table would leave the old
   * record file behind and create a new one, normal mode would move the row in
   * place). That is a delete plus an insert, and it has to be asked for.
   */
  async updateRow(
    dbName: string,
    tableName: string,
    primaryKeyVal: PrimaryKeyVal,
    row: TableRow,
    rev: RowRev,
  ): Promise<RowWriteResult> {
    const { mode, sha } = this.readRev(rev, dbName, tableName);
    const primaryKeyName = this.getPrimaryKeyColumn(dbName, tableName).id;

    if (!isSamePrimaryKey(row[primaryKeyName], primaryKeyVal)) {
      throw new Error(
        `Failed to update row, it would replace the row whose ${primaryKeyName} is '${String(
          primaryKeyVal, // eslint-disable-line @typescript-eslint/comma-dangle
        )}' with a row whose ${primaryKeyName} is '${String(
          row[primaryKeyName], // eslint-disable-line @typescript-eslint/comma-dangle
        )}' — changing a primary key is a delete plus an insert, not an update, dbName: ${dbName}, tableName: ${tableName}.`,
      );
    }

    if (mode === 'split-table') {
      const data = await this.saveRecordFile(
        dbName,
        tableName,
        primaryKeyName,
        row,
        sha,
      );
      return withWriteInfo(data, mode, 'update');
    }

    const { content } = await this.getTableRows(dbName, tableName);
    const index = content.findIndex((item) =>
      isSamePrimaryKey(item[primaryKeyName], primaryKeyVal),
    );
    if (index === -1) {
      throw createGithubError(
        'ROW_NOT_FOUND',
        `Failed to update row, no row with this primary key in the table, dbName: ${dbName}, tableName: ${tableName}.`,
      );
    }
    const newContent = [...content];
    newContent[index] = row;
    const data = await this.updateTableFile(dbName, tableName, newContent, sha);
    return withWriteInfo(data, mode, 'update');
  }

  /**
   * Remove one row.
   *
   * In normal mode, deleting the last row leaves an empty table file (`[]`)
   * rather than deleting the file: whether the file exists is not the row's
   * business, and a table with no rows is a normal state.
   *
   * Everything about `rev` is as in `updateRow()`.
   */
  async deleteRow(
    dbName: string,
    tableName: string,
    primaryKeyVal: PrimaryKeyVal,
    rev: RowRev,
  ): Promise<RowWriteResult> {
    const { mode, sha } = this.readRev(rev, dbName, tableName);

    if (mode === 'split-table') {
      const data = await this.deleteRecordFile(
        dbName,
        tableName,
        primaryKeyVal,
        sha,
      );
      return withWriteInfo(data, mode, 'delete');
    }

    const primaryKeyName = this.getPrimaryKeyColumn(dbName, tableName).id;
    const { content } = await this.getTableRows(dbName, tableName);
    const index = content.findIndex((item) =>
      isSamePrimaryKey(item[primaryKeyName], primaryKeyVal),
    );
    if (index === -1) {
      throw createGithubError(
        'ROW_NOT_FOUND',
        `Failed to delete row, no row with this primary key in the table, dbName: ${dbName}, tableName: ${tableName}.`,
      );
    }
    const newContent = content.filter((item, i) => i !== index);
    const data = await this.updateTableFile(dbName, tableName, newContent, sha);
    return withWriteInfo(data, mode, 'delete');
  }
}
