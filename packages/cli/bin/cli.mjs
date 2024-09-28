#! /usr/bin/env node
import {
  processDbs,
  splitTableFileToRecordFiles,
  mergeRecordFilesToTableFile,
} from './utils.mjs';

const dir = process.argv[2];
const opt = process.argv[3];
const dbTable = process.argv[4]; // Optional, only process this db table

(() => {
  if (!dir || !opt) {
    console.error('Invalid params.');
    console.error('For example, "$ db-man-cli dbs split".');
    process.exitCode = 1;
    return;
  }

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
    console.error('For example, "$ db-man-cli dbs split".');
  }
})();
