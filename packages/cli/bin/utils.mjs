import { exec } from 'child_process';
import { readFile, readdir } from 'fs/promises';

import {
  DB_CFG_FILENAME,
  ERR_NO_PRIMARY_KEY,
  TABLE_DATA_FILE_SUFFIX,
} from './constants.mjs';

export const convert = (data) => {
  const rows = JSON.parse(data);
  return rows;
};

/**
 *
 * @param {*} dir Dir for all databases
 * @returns example:
 * ```
 * dbs = [
 *   { name: 'iam', tables:
 *     [{ name: 'users', columns: [{id: 'id', type: 'string', primary: true}]
 *   }
 * ]
 * ```
 */
export const getDbs = async (dir) => {
  const dbs = [];
  let dbNames = [];

  try {
    dbNames = await readdir(`./${dir}`, { withFileTypes: true })
      .then((dirents) =>
        dirents.filter((dirent) => {
          if (dirent.isDirectory()) {
            return dirent;
          } else {
            console.warn(`[WARN] Skip non dir: ${dirent.name}`);
            return false;
          }
        })
      )
      .then((dirs) => dirs.map((dir) => dir.name));
  } catch (err) {
    console.error(`[ERROR] Failed to list db dir files, err:`, err);
    return [];
  }

  for (const dbName of dbNames) {
    let tables = [];
    try {
      const fileContent = await readFile(
        `./${dir}/${dbName}/${DB_CFG_FILENAME}`,
        'utf8'
      );
      tables = JSON.parse(fileContent).tables;
    } catch (err) {
      console.error(
        `[ERROR] [${dbName}] Failed to read db cfg data file, err:`,
        err
      );
      return [];
    }
    dbs.push({
      name: dbName,
      tables,
    });
  }

  return dbs;
};

/**
 *
 * @param {*} table
 * @returns
 */
export const getPrimaryKey = (table) => {
  const primaryCol = table.columns.find((col) => col.primary);
  if (!primaryCol) {
    console.error(
      `[ERROR] [${table.name}] No primary key found in table!`,
      table.columns
    );
    process.exitCode = ERR_NO_PRIMARY_KEY;
    process.exit();
  }

  const primaryKey = primaryCol.id;
  return primaryKey;
};

/**
 *
 * @param {*} dir
 * @param {string} dbTable Optional, only process this db table, e.g. "iam/users"
 * @param {Function} _processTable One of splitTableFileToRecordFilesAsync, mergeRecordFilesToTableFileAsync, testDbIntegrity
 */
export const processDbTables = async (dir, dbTable, _processTable) => {
  const dbs = await getDbs(dir);

  for (const db of dbs) {
    for (const table of db.tables) {
      if (dbTable && `${db.name}/${table.name}` !== dbTable) {
        console.debug(
          `[DEBUG] [${db.name}/${table.name}] Skip table, dbTable: ${dbTable}`
        );
        continue;
      }

      console.debug(`[DEBUG] [${db.name}/${table.name}] Start process table`);
      await _processTable(dir, db.name, table);
      console.debug(`[DEBUG] [${db.name}/${table.name}] Finish process table`);
    }
  }
};

/**
 * db integrity testing
 * TODO check the db data (integrity, etc.), need a single GitHub action to run this regularly
 */
export const testDbIntegrity = async (dir, dbName, tableName, primaryKey) => {
  let files = null;
  try {
    files = await readdir(`./${dir}/${dbName}/${tableName}`);
  } catch (err) {
    console.error(
      `[ERROR] [${dbName}/${tableName}] Failed to list table dir files, err:`,
      err
    );
    return;
  }

  let data = null;
  try {
    data = await readFile(
      `./${dir}/${dbName}/${tableName}${TABLE_DATA_FILE_SUFFIX}`,
      'utf8'
    );
  } catch (err) {
    console.error(
      `[ERROR] [${dbName}/${tableName}] Failed to read table data file, err:`,
      err
    );
    return;
  }

  if (!data) {
    console.error(`[ERROR] [${dbName}/${tableName}] Table data file is empty!`);
    return;
  }

  const rows = convert(data);

  // The table record files count and rows count should be the same
  console.debug(
    `[DEBUG] [${dbName}/${tableName}] files count: ${files.length}, rows count: ${rows.length}`
  );
};

/**
 * Get changed files by sha
 *
 * Example: when only changed 1 record file
 * ```
 * $ git diff-tree --no-commit-id --name-only -r 2eab0c1df07639dd0d82a342f8f3a1e2a112a6e7
 * db_files_dir/iam/users/789900000004.json
 * ```
 *
 * Example: when changed 2 record files
 * ```
 * $ git diff-tree --no-commit-id --name-only -r 2ece7c30ca731901377f04236422772e4e997cd3
 * db_files_dir/iam/users/789900000005.json
 * db_files_dir/iam/users/789900000006.json
 * ```
 *
 * Example: when changed 1 table file
 * ```
 * $ git diff-tree --no-commit-id --name-only -r 2ece7c30ca731901377f04236422772e4e997cd3
 * db_files_dir/iam/users.data.json
 * ```
 *
 * Example: when changed 2 table files
 * ```
 * $ git diff-tree --no-commit-id --name-only -r 2ece7c30ca731901377f04236422772e4e997cd3
 * db_files_dir/iam/users.data.json
 * db_files_dir/iam/roles.data.json
 * ```
 *
 * !!! This function need a reasonable depth of git clone, otherwise the given sha is not in the history
 * !!! Especially on GitHub Actions, the default depth is 1 by default
 * !!! To support this in GitHub Actions, follow the steps below:
 * ```
 * - name: Checkout code
 *   uses: actions/checkout@v2
 *   with:
 *     fetch-depth: 2 # `git diff-tree` (used in `@db-man/cli mergeUpdatedTables`) need to compare HEAD and HEAD~1, so need to fetch 2 commits
 * ```
 *
 * @param {string} sha
 * @returns {string[]} - An array of changed file paths, e.g. ['iam/users/2.json', 'iam/roles/developer.json']
 */
export async function getChangedFilesBySha(sha) {
  return new Promise((resolve, reject) => {
    // git diff-tree --no-commit-id --name-only -r 2eab0c1df07639dd0d82a342f8f3a1e2a112a6e7
    const cmd = `git diff-tree --no-commit-id --name-only -r ${sha}`;
    console.debug(`[DEBUG] Executing git command: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing git: ${error}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Git stderr: ${stderr}`);
        return reject(new Error(stderr));
      }

      // Split the git log into individual file paths
      const changedFiles = stdout.trim().split('\n');
      console.debug(
        `[DEBUG] getChangedFilesBySha: changedFiles:`,
        changedFiles
      );
      resolve(changedFiles);
    });
  });
}

/**
 * Extracts the changed database tables from the given git log.
 * @param {string[]} filePaths - An array of changed file paths
 *                               Example of changed record files: ['iam/users/2.json', 'iam/roles/developer.json']
 *                               Example of changed table files: ['iam/users.data.json', 'iam/roles.data.json']
 * @returns {string[]} - An array of unique database table paths, e.g. ['iam/users', 'iam/roles']
 */
export function getChangedDbTables(filePaths) {
  // Extract the directory paths (excluding the file names)
  const tablePaths = filePaths.map((filePath) => {
    // get file name(e.g. 'iam/users/2.json' -> '2.json') to determine it's a table file or a record file
    const fileName = filePath.split('/').pop();
    if (fileName.endsWith(TABLE_DATA_FILE_SUFFIX)) {
      // in current repo, for testing, filePath='cli/__test_dbs_dir__/iam/users.data.json'
      // in real-world, filePath='iam/users.data.json'
      const parts = filePath.split('/');
      return parts
        .slice(parts.length - 2, parts.length)
        .join('/')
        .replace(TABLE_DATA_FILE_SUFFIX, '');
    }

    // in current repo, for testing, filePath='cli/__test_dbs_dir__/iam/users/1.json'
    // in real-world, filePath='iam/users/2.json'
    const parts = filePath.split('/');
    return parts.slice(parts.length - 3, parts.length - 1).join('/');
  });

  // Return unique table paths, e.g. ['iam/users', 'iam/roles']
  const uniqueTablePaths = [...new Set(tablePaths)];
  console.debug(
    `[DEBUG] getChangedDbTables: uniqueTablePaths:`,
    uniqueTablePaths
  );
  return uniqueTablePaths;
}

/**
 * Process updated tables to split or merge
 * @param {string} dir e.g. "db_files_dir"
 * @param {string} sha SHA of the commit, e.g. "2eab0c1df07639dd0d82a342f8f3a1e2a112a6e7"
 *                     e.g. a table (e.g. iam/users.data.json) changed sha
 *                     e.g. a record (e.g. iam/users/2.json) changed sha
 * @param {Function} processFunction e.g. splitTableFileToRecordFilesAsync, mergeRecordFilesToTableFileAsync
 */
export const processUpdatedTables = async (dir, sha, processFunction) => {
  const dbs = await getDbs(dir);
  console.debug('dbs:', dbs);

  const changedFiles = await getChangedFilesBySha(sha);
  const changedTables = getChangedDbTables(changedFiles);

  // multiple tables can process in parallel, no need to wait for the previous table to finish
  changedTables.forEach((dbTable) => {
    const [dbName, tableName] = dbTable.split('/');
    const table = dbs
      .find((db) => db.name === dbName)
      .tables.find((table) => table.name === tableName);
    if (!table) {
      console.error('Cannot find table:', dbTable);
      process.exitCode = ERR_NOT_FOUND_TABLE;
      process.exit();
    }

    console.debug('start process table:', dbName, tableName);
    processFunction(dir, dbName, table);
  });
};
