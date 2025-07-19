import { readFile, writeFile, readdir } from 'fs/promises';
import path from 'path';
import { utils } from '@db-man/github';

import { TABLE_DATA_FILE_SUFFIX } from './constants.mjs';
import { convert, getPrimaryKey } from './utils.mjs';

/**
 * Split one big file to small files
 * @param {string} dir e.g. "db_files_dir"
 * @param {string} dbName e.g. "iam"
 * @param {Object} table e.g. { name: "users", columns: [{ name: "id", type: "NUMBER" }, { name: "name", type: "STRING" }] }
 */
export const splitTableFileToRecordFilesAsync = async (dir, dbName, table) => {
  const primaryKey = getPrimaryKey(table);

  let data = null;
  try {
    data = await readFile(
      `./${dir}/${dbName}/${table.name}${TABLE_DATA_FILE_SUFFIX}`,
      'utf8'
    );
  } catch (err) {
    console.error(
      `[ERROR] [${dbName}/${table.name}] Failed to read table data file, err:`,
      err
    );
    return;
  }

  if (!data) {
    console.error(
      `[ERROR] [${dbName}/${table.name}] Table data file is empty!`
    );
    return;
  }

  const rows = convert(data);

  console.debug(
    `[DEBUG] [${dbName}/${table.name}] Split table, total rows: ${rows.length}`
  );

  const primaryColumn = table.columns.find((col) => col.primary);

  for (const row of rows) {
    try {
      let filename = '';
      if (primaryColumn.type === 'NUMBER') {
        filename = row[primaryKey] + '';
      } else {
        filename = utils.validFilename(row[primaryKey]);
      }

      await writeFile(
        `./${dir}/${dbName}/${table.name}/${filename}.json`,
        JSON.stringify(row, null, '  '),
        'utf8'
      );
    } catch (err) {
      console.error(
        `[ERROR] [${dbName}/${table.name}] Failed to write to a record file, err:`,
        err
      );
    }
  }
};

/**
 * Merge multiple small files into one big file
 * @param {string} dir e.g. "db_files_dir"
 * @param {string} dbName e.g. "iam"
 * @param {Object} table e.g. { name: "users", columns: [{ name: "id", type: "NUMBER" }, { name: "name", type: "STRING" }] }
 */
export const mergeRecordFilesToTableFileAsync = async (dir, dbName, table) => {
  const primaryKey = getPrimaryKey(table);

  let files = null;
  try {
    files = await readdir(`./${dir}/${dbName}/${table.name}`);
  } catch (err) {
    console.error(
      `[ERROR] [${dbName}/${table.name}] Failed to list table dir files, err:`,
      err
    );
    return;
  }

  const rows = [];

  for (const file of files) {
    // Only process .json files
    if (path.extname(file) !== '.json') {
      console.warn(
        `[WARN] [${dbName}/${table.name}] Skip non json record file: ${file}`
      );
      continue;
    }

    let data = null;
    try {
      data = await readFile(`./${dir}/${dbName}/${table.name}/${file}`, 'utf8');
    } catch (err) {
      console.error(
        `[ERROR] [${dbName}/${table.name}] Failed to read record file: ${file}, err:`,
        err
      );
      continue;
    }

    if (!data) {
      console.warn(
        `[WARN] [${dbName}/${table.name}] Record file is empty: ${file}`
      );
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
      `./${dir}/${dbName}/${table.name}${TABLE_DATA_FILE_SUFFIX}`,
      JSON.stringify(rows, null, ' '),
      'utf8'
    );
  } catch (err) {
    console.error(
      `[ERROR] [${dbName}/${table.name}] Failed to write to a table data file, err:`,
      err
    );
    return;
  }

  console.debug(
    `[DEBUG] [${dbName}/${table.name}] Merged ${rows.length} rows into table file.`
  );
};
