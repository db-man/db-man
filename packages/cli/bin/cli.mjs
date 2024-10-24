#! /usr/bin/env node

import fs from 'fs';

import {
  processDbs,
  splitTableFileToRecordFiles,
  mergeRecordFilesToTableFile,
} from './utils.mjs';
import insightsAsync from './insights.mjs';

/**
 * This script is used to:
 * - Split a large table file into multiple record files.
 * - Merge multiple record files into a large table file.
 * - Convert git log commit data to csv format which shows the total number of lines in a file on each date
 *
 * This script need to run in the root of the db repo.
 *
 * Usage:
 * ```sh
 * npx @db-man/cli split
 * npx @db-man/cli split iam/users
 * npx @db-man/cli insights iam/users
 * ```
 */

const opt = process.argv[2];
const dbTable = process.argv[3]; // Optional, only process this db table, e.g. "iam/users".

(() => {
  if (!opt) {
    console.error('Invalid params.');
    console.error('For example, "$ db-man-cli split".');
    process.exitCode = 1;
    return;
  }

  const dbsJson = fs.readFileSync('dbs.json', 'utf8');
  const dir = JSON.parse(dbsJson).repoPath;

  if (opt === 'split') {
    (async () => {
      await processDbs(splitTableFileToRecordFiles, dir, dbTable);
    })();
  } else if (opt === 'merge') {
    (async () => {
      await processDbs(mergeRecordFilesToTableFile, dir, dbTable);
    })();
  } else if (opt === 'insights') {
    insightsAsync(dbTable);
  } else {
    console.error('Invalid params, should be "split" or "merge".');
    console.error('For example, "$ db-man-cli split".');
  }
})();
