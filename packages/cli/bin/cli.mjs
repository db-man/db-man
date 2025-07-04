#! /usr/bin/env node

import fs from 'fs';

import {
  processDbs,
  splitTableFileToRecordFilesAsync,
  mergeRecordFilesToTableFileAsync,
} from './utils.mjs';
import {
  printInsightsAsync,
  generateInsightsForAllDbTablesAsync,
} from './insights.mjs';
import mergeUpdatedTables from './mergeUpdatedTables.mjs';

/**
 * This script is used to:
 * - split Split a large table file into multiple record files.
 * - merge - Merge multiple record files into a large table file.
 * - mergeUpdatedTables - According to the given Git SHA, merge the changed record files into the corresponding table files.
 * - printInsights - Convert git log commit data to csv format which shows the total number of lines in a file on each date
 * - generateInsightsForAllDbTables - Generate insights for all db tables
 *
 * This script need to run in the root of the db repo.
 *
 * Usage:
 * ```sh
 * npx @db-man/cli split
 * npx @db-man/cli split iam/users
 * npx @db-man/cli printInsights iam/users # Print insights for a db table
 * npx @db-man/cli generateInsightsForAllDbTables # Generate insights for all db tables
 * npx @db-man/cli mergeUpdatedTables 8a44b1f55509cd033fd9ac000c218c623f21f6d4
 * ```
 */

const opt = process.argv[2];

(() => {
  if (!opt) {
    console.error('Invalid params.');
    console.error('For example, "$ db-man-cli split".');
    process.exitCode = 1;
    return;
  }

  const dbsJson = fs.readFileSync('dbs.json', 'utf8');
  const dir = JSON.parse(dbsJson).repoPath;
  console.debug(`[DEBUG] dir: ${dir}`);

  if (opt === 'split') {
    (async () => {
      const dbTable = process.argv[3]; // Optional, only process this db table, e.g. "iam/users".
      await processDbs(splitTableFileToRecordFilesAsync, dir, dbTable);
    })();
  } else if (opt === 'merge') {
    (async () => {
      const dbTable = process.argv[3]; // Optional, only process this db table, e.g. "iam/users".
      await processDbs(mergeRecordFilesToTableFileAsync, dir, dbTable);
    })();
  } else if (opt === 'mergeUpdatedTables') {
    (async () => {
      // sha is from GitHub Actions pipeline env var $GITHUB_SHA
      const sha = process.argv[3];
      await mergeUpdatedTables(dir, sha);
    })();
  } else if (opt === 'printInsights') {
    const dbTable = process.argv[3]; // Optional, only process this db table, e.g. "iam/users".
    printInsightsAsync(dir, dbTable);
  } else if (opt === 'generateInsightsForAllDbTables') {
    generateInsightsForAllDbTablesAsync(dir);
  } else {
    console.error('Invalid params, should be "split" or "merge".');
    console.error('For example, "$ db-man-cli split".');
  }
})();
