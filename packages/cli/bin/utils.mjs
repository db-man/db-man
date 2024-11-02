import path from 'path';
import { readFile, writeFile, readdir } from 'fs/promises';

import { DB_CFG_FILENAME, ERR_NO_PRIMARY_KEY } from './constants.mjs';

/**
 * Get valid file name
 * See: https://stackoverflow.com/a/4814088
 * @param oldStr
 * @returns POSIX "Fully portable filenames"
 * @see https://github.com/db-man/github/blob/main/src/githubDb.js#L15
 */
export const validFilename = (oldStr) => {
  return oldStr.replace(/[^a-zA-Z0-9._-]/g, '_');
};

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
            console.warn('[WARN] Skip non dir:', dirent.name);
            return false;
          }
        })
      )
      .then((dirs) => dirs.map((dir) => dir.name));
  } catch (err) {
    console.error('Failed to list db dir files, err:', err);
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
      console.error('Failed to read db cfg data file, err:', err);
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
const getPrimaryKey = (table) => {
  const primaryCol = table.columns.find((col) => col.primary);
  if (!primaryCol) {
    console.error('No primary key found in table!', table.columns);
    process.exitCode = ERR_NO_PRIMARY_KEY;
    process.exit();
  }

  const primaryKey = primaryCol.id;
  return primaryKey;
};

/**
 *
 * @param {Function} _processTable One of splitTableFileToRecordFilesAsync, mergeRecordFilesToTableFileAsync, testDbIntegrity
 * @param {*} dir
 * @param {string} dbTable Optional, only process this db table, e.g. "iam/users"
 */
export const processDbs = async (_processTable, dir, dbTable) => {
  const dbs = await getDbs(dir);

  for (const db of dbs) {
    for (const table of db.tables) {
      if (dbTable && `${db.name}/${table.name}` !== dbTable) {
        console.debug('skip table:', db.name, table.name);
        continue;
      }

      console.debug('start process table:', db.name, table.name);
      await _processTable(dir, db.name, table);
      console.debug('finish process table:', db.name, table.name);
    }
  }
};

// split one big file to small files
export const splitTableFileToRecordFilesAsync = async (dir, dbName, table) => {
  const primaryKey = getPrimaryKey(table);

  let data = null;
  try {
    data = await readFile(`./${dir}/${dbName}/${table.name}.data.json`, 'utf8');
  } catch (err) {
    console.error('Failed to read table data file, err:', err);
    return;
  }

  if (!data) {
    console.error('table data file is empty!');
    return;
  }

  const rows = convert(data);

  console.debug(`Split ${dbName}/${table.name} rows count: ${rows.length}`);

  const primaryColumn = table.columns.find((col) => col.primary);

  for (const row of rows) {
    try {
      let filename = '';
      if (primaryColumn.type === 'NUMBER') {
        filename = row[primaryKey] + '';
      } else {
        filename = validFilename(row[primaryKey]);
      }

      await writeFile(
        `./${dir}/${dbName}/${table.name}/${filename}.json`,
        JSON.stringify(row, null, '  '),
        'utf8'
      );
    } catch (err) {
      console.error('Failed to write to a record file, err:', err);
    }
  }
};

// merge multiple small files into one big file
export const mergeRecordFilesToTableFileAsync = async (dir, dbName, table) => {
  const primaryKey = getPrimaryKey(table);

  let files = null;
  try {
    files = await readdir(`./${dir}/${dbName}/${table.name}`);
  } catch (err) {
    console.error('Failed to list table dir files, err:', err);
    return;
  }

  const rows = [];

  for (const file of files) {
    // Only process .json files
    if (path.extname(file) !== '.json') {
      console.warn('skip non json record file:', file);
      continue;
    }

    let data = null;
    try {
      data = await readFile(`./${dir}/${dbName}/${table.name}/${file}`, 'utf8');
    } catch (err) {
      console.error('Failed to read record file, err:', err);
      continue;
    }

    if (!data) {
      console.warn('record file is empty!');
      continue;
    }

    const record = JSON.parse(data);
    rows.push(record);
  }

  // Sort by primary key
  rows.sort((a, b) => {
    return ('' + a[primaryKey]).localeCompare('' + b[primaryKey]);
  });

  try {
    await writeFile(
      `./${dir}/${dbName}/${table.name}.data.json`,
      JSON.stringify(rows, null, ' '),
      'utf8'
    );
  } catch (err) {
    console.error('Failed to write to a table data file, err:', err);
    return;
  }

  console.debug(
    `Merged ${rows.length} rows into ${dbName}/${table.name} table file.`
  );
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
    console.error('Failed to list table dir files, err:', err);
    return;
  }

  let data = null;
  try {
    data = await readFile(`./${dir}/${dbName}/${tableName}.data.json`, 'utf8');
  } catch (err) {
    console.error('Failed to read table data file, err:', err);
    return;
  }

  if (!data) {
    console.error('table data file is empty!');
    return;
  }

  const rows = convert(data);

  console.debug('count:', files.length, rows.length);
};

export function foo() {
  return 'bar';
}
