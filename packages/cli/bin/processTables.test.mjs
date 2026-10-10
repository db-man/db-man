import { mkdir, mkdtemp, readdir, rm, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';

import { utils } from '@db-man/github';

import { splitTableFileToRecordFilesAsync } from './processTables.mjs';

const USERS_TABLE = {
  name: 'users',
  columns: [
    { id: 'userId', name: 'User ID', type: 'NUMBER', primary: true },
    { id: 'name', name: 'Name', type: 'STRING' },
  ],
};

const ROLES_TABLE = {
  name: 'roles',
  columns: [
    { id: 'code', name: 'Code', type: 'STRING', primary: true },
    { id: 'name', name: 'Name', type: 'STRING' },
  ],
};

/**
 * `processTables.mjs` builds every path as `./${dir}/...`, so `dir` has to be
 * relative to the working directory. The fixture lives in the OS temp dir and
 * the relative form is handed over, so nothing is written inside the repo and
 * the working directory stays put (no `process.chdir`).
 */
const buildTempDir = async () => {
  const abs = await mkdtemp(path.join(os.tmpdir(), 'dbm-cli-'));
  return { abs, rel: path.relative(process.cwd(), abs) };
};

const writeTableFile = (abs, dbName, tableName, rows) =>
  writeFile(
    path.join(abs, dbName, `${tableName}.data.json`),
    JSON.stringify(rows),
    'utf8',
  );

const listRecordFiles = (abs, dbName, tableName) =>
  readdir(path.join(abs, dbName, tableName)).then((files) => files.sort());

describe('splitTableFileToRecordFilesAsync — record file names', () => {
  let temp;

  beforeEach(async () => {
    temp = await buildTempDir();
    // The record directories already exist in real use — splitting writes into
    // a table directory that is there. Create them so a missing dir is not
    // mistaken for the behaviour under test.
    await mkdir(path.join(temp.abs, 'iam', 'users'), { recursive: true });
    await mkdir(path.join(temp.abs, 'iam', 'roles'), { recursive: true });
  });

  afterEach(async () => {
    await rm(temp.abs, { recursive: true, force: true });
  });

  it('names a NUMBER record file the way utils.getRecordFileName does', async () => {
    // 1e21 stringifies as "1e+21"; the "+" has to be escaped. This is the one
    // input the two file name rules disagreed on: the CLI wrote
    // "1e+21.json" while @db-man/github looked for "1e_21.json".
    await writeTableFile(temp.abs, 'iam', 'users', [
      { userId: 1e21, name: 'big' },
    ]);

    await splitTableFileToRecordFilesAsync(temp.rel, 'iam', USERS_TABLE);

    expect(utils.getRecordFileName(1e21)).toBe('1e_21.json');
    expect(await listRecordFiles(temp.abs, 'iam', 'users')).toEqual([
      utils.getRecordFileName(1e21),
    ]);
  });

  it('names every NUMBER record file the way utils.getRecordFileName does', async () => {
    const rows = [
      { userId: 1, name: 'a1' },
      { userId: -1, name: 'negative' },
      { userId: 1744820403529, name: 'timestamp' },
      { userId: 1.5, name: 'fraction' },
    ];
    await writeTableFile(temp.abs, 'iam', 'users', rows);

    await splitTableFileToRecordFilesAsync(temp.rel, 'iam', USERS_TABLE);

    expect(await listRecordFiles(temp.abs, 'iam', 'users')).toEqual(
      rows.map((row) => utils.getRecordFileName(row.userId)).sort(),
    );
  });

  it('names a STRING record file the way utils.getRecordFileName does', async () => {
    const rows = [
      { code: 'a/b c', name: 'needs escaping' },
      { code: 'developer', name: 'plain' },
    ];
    await writeTableFile(temp.abs, 'iam', 'roles', rows);

    await splitTableFileToRecordFilesAsync(temp.rel, 'iam', ROLES_TABLE);

    expect(await listRecordFiles(temp.abs, 'iam', 'roles')).toEqual(
      rows.map((row) => utils.getRecordFileName(row.code)).sort(),
    );
  });
});
