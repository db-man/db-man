#! /usr/bin/env node
import {
  processDbs,
  splitTableFileToRecordFiles,
  mergeRecordFilesToTableFile,
} from './utils.mjs';
import fs from 'fs';

const opt = process.argv[2];
const dbTable = process.argv[3]; // Optional, only process this db table

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
  } else {
    console.error('Invalid params, should be "split" or "merge".');
    console.error('For example, "$ db-man-cli split".');
  }
})();
