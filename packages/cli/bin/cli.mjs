#! /usr/bin/env node

import fs from 'fs';

import {
  processDbs,
  splitTableFileToRecordFilesAsync,
  mergeRecordFilesToTableFileAsync,
} from './utils.mjs';
import insightsAsync from './insights.mjs';
import mergeV2 from './mergeV2.mjs';

/**
 * This script is used to:
 * - split Split a large table file into multiple record files.
 * - merge - Merge multiple record files into a large table file.
 * - mergeV2 - According to the given Git SHA, merge the changed record files into the corresponding table files.
 * - insights - Convert git log commit data to csv format which shows the total number of lines in a file on each date
 *
 * This script need to run in the root of the db repo.
 *
 * Usage:
 * ```sh
 * npx @db-man/cli split
 * npx @db-man/cli split iam/users
 * npx @db-man/cli insights iam/users
 * npx @db-man/cli mergeV2 0392fb65486180f2071b0cbdcc94ebc3f591e0b4
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
  } else if (opt === 'mergeV2') {
    (async () => {
      // sha is from GitHub Actions pipeline env var $GITHUB_SHA
      const sha = process.argv[3];
      await mergeV2(dir, sha);
    })();
  } else if (opt === 'insights') {
    const dbTable = process.argv[3]; // Optional, only process this db table, e.g. "iam/users".
    insightsAsync(dir, dbTable);
  } else {
    console.error('Invalid params, should be "split" or "merge".');
    console.error('For example, "$ db-man-cli split".');
  }
})();
