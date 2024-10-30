import { exec } from 'child_process';

import { ERR_NOT_FOUND_TABLE } from './constants.mjs';
import { getDbs, mergeRecordFilesToTableFileAsync } from './utils.mjs';

/**
 * Function to execute git command
 *
 * when only changed 1 record file
 * ```
 * $ git diff-tree --no-commit-id --name-only -r 2eab0c1df07639dd0d82a342f8f3a1e2a112a6e7
 * db_files_dir/iam/users/789900000004.json
 * ```
 *
 * when changed 2 record files
 * ```
 * $ git diff-tree --no-commit-id --name-only -r 2ece7c30ca731901377f04236422772e4e997cd3
 * db_files_dir/iam/users/789900000005.json
 * db_files_dir/iam/users/789900000006.json
 *
 * @param {string} sha
 * @returns
 */
export function getChangedFilesBySha(sha) {
  return new Promise((resolve, reject) => {
    // git diff-tree --no-commit-id --name-only -r 2eab0c1df07639dd0d82a342f8f3a1e2a112a6e7
    const cmd = `git diff-tree --no-commit-id --name-only -r ${sha}`;
    console.debug(`Executing git command: ${cmd}`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing git: ${error}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      // console.debug(`Git log output:\n${stdout}`);
      resolve(stdout);
    });
  });
}

/**
 * Extracts the changed database tables from the given git log.
 * @param {string} gitLog - The git log containing the changed file paths.
 * @returns {string[]} - An array of unique database table paths.
 */
export function getChangedDbTables(gitLog) {
  // Split the git log into individual file paths
  const filePaths = gitLog.trim().split('\n');

  // Extract the directory paths (excluding the file names)
  const tablePaths = filePaths.map((filePath) => {
    // in code repo, for testing, filePath='cli/__test_dbs_dir__/iam/users/1.json'
    // in real-world, filePath='iam/users/2.json'
    const parts = filePath.split('/');
    return parts.slice(parts.length - 3, parts.length - 1).join('/');
  });

  // Return unique table paths
  return [...new Set(tablePaths)];
}

/**
 * Merge V2
 * @param {string} dir e.g. "db_files_dir"
 * @param {string} sha e.g. "2eab0c1df07639dd0d82a342f8f3a1e2a112a6e7"
 */
const mergeV2 = async (dir, sha) => {
  const dbs = await getDbs(dir);

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
    mergeRecordFilesToTableFileAsync(dir, dbName, table);
  });
};

export default mergeV2;
