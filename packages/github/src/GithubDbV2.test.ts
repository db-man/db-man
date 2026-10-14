import GithubDbV2 from './GithubDbV2';
import GithubV2 from './GithubV2';
import { createGithubError, isGithubError } from './errors';
import type { DatabaseMap, DbMode } from './types';

jest.mock('./GithubV2', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const MockedGithub = GithubV2 as unknown as jest.Mock;

/** GitHub hands file content back base64 encoded. */
const toBase64 = (value: string) => Buffer.from(value).toString('base64');

const mockDbsSchema: DatabaseMap = {
  iam: {
    name: 'iam',
    description: 'iam db',
    tables: [
      {
        name: 'users',
        large: true,
        columns: [
          { id: 'userId', name: 'User ID', type: 'NUMBER', primary: true },
          { id: 'name', name: 'Name', type: 'STRING' },
        ],
      },
      {
        name: 'roles',
        columns: [{ id: 'code', name: 'Code', type: 'STRING', primary: true }],
      },
      // A table whose schema forgot the primary column. It is legal-looking
      // JSON, so nothing upstream rejects it — the row-level API has to.
      { name: 'nopk', columns: [{ id: 'x', name: 'X', type: 'STRING' }] },
    ],
  },
};

/**
 * Every GithubV2 method GithubDbV2 may reach for, in one place, so a new case
 * can never silently call an undefined method on the mock.
 */
const createMockGithub = () => ({
  getFileContentAndSha: jest.fn(),
  getFileRawContent: jest.fn(),
  listDir: jest.fn(),
  getBlobContentAndSha: jest.fn(),
  getPlainTextByPath: jest.fn(),
  createFile: jest.fn(),
  saveFile: jest.fn(),
  deleteFile: jest.fn(),
});

/** The mode is the only difference between the two halves of the row API. */
const buildGithubDb = (dbModes: DbMode) =>
  new GithubDbV2({
    personalAccessToken: 'test-token',
    repoPath: 'dbs',
    owner: 'db-man',
    repoName: 'db',
    dbsSchema: mockDbsSchema,
    dbModes,
  });

describe('GithubDbV2', () => {
  let mockGithub: ReturnType<typeof createMockGithub>;
  let gd: GithubDbV2;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGithub = createMockGithub();
    MockedGithub.mockImplementation(() => mockGithub as any);
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    gd = buildGithubDb('normal');
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
  });

  describe('constructor', () => {
    const valid = {
      personalAccessToken: 'test-token',
      repoPath: 'dbs',
      owner: 'db-man',
      repoName: 'db',
      dbsSchema: mockDbsSchema,
      dbModes: 'normal' as DbMode,
    };

    it('should throw when personalAccessToken is undefined', () => {
      expect(
        () =>
          new GithubDbV2({ ...valid, personalAccessToken: undefined as any }),
      ).toThrow('Input personalAccessToken is undefined or null!');
    });

    it('should throw when personalAccessToken is null', () => {
      expect(
        () => new GithubDbV2({ ...valid, personalAccessToken: null as any }),
      ).toThrow('Input personalAccessToken is undefined or null!');
    });

    it('should throw when repoPath is empty', () => {
      expect(() => new GithubDbV2({ ...valid, repoPath: '' })).toThrow(
        'Input repoPath is invalid!',
      );
    });

    it('should throw when dbsSchema is missing', () => {
      expect(
        () => new GithubDbV2({ ...valid, dbsSchema: undefined as any }),
      ).toThrow('Input dbsSchema is invalid!');
    });

    it('should throw when owner is empty', () => {
      expect(() => new GithubDbV2({ ...valid, owner: '' })).toThrow(
        'Input owner is invalid!',
      );
    });

    it('should throw when repoName is empty', () => {
      expect(() => new GithubDbV2({ ...valid, repoName: '' })).toThrow(
        'Input repoName is invalid!',
      );
    });

    // The mode is required and is not defaulted on purpose: it decides which
    // file a row is written to, and a wrong guess writes to the wrong place
    // without anyone noticing. See plan §2.1.
    it('should throw when dbModes is missing', () => {
      expect(
        () => new GithubDbV2({ ...valid, dbModes: undefined as any }),
      ).toThrow(
        "Input dbModes is invalid, expected 'normal' or 'split-table', got 'undefined'!",
      );
    });

    it('should throw when dbModes is not one the library knows', () => {
      expect(() => new GithubDbV2({ ...valid, dbModes: 'split' as any })).toThrow(
        "Input dbModes is invalid, expected 'normal' or 'split-table', got 'split'!",
      );
    });

    it('should build a GithubV2 instance with the same credentials', () => {
      expect(MockedGithub).toHaveBeenCalledWith({
        personalAccessToken: 'test-token',
        owner: 'db-man',
        repoName: 'db',
      });
    });
  });

  describe('path helpers', () => {
    // These look like trivial string joins, but getTableDataPath() uses
    // `<table>.data.json` while getInsightsPath() uses `<table>.insights.gitlog`
    // — mixing them up would write data into the wrong file.
    it('should build every path and URL from the configured repoPath', () => {
      expect(gd.getGitHubRepoPath()).toBe('https://github.com/db-man/db');
      expect(gd.getGitHubFullPath('dbs/iam/users.data.json')).toBe(
        'https://github.com/db-man/db/blob/main/dbs/iam/users.data.json',
      );
      expect(gd.getGitHubHistoryPath('dbs/iam/users.data.json')).toBe(
        'https://github.com/db-man/db/commits/main/dbs/iam/users.data.json',
      );
      expect(gd.getDbConfigPath('iam')).toBe('dbs/iam/dbcfg.json');
      expect(gd.getDbViewScriptPath('iam', 'view1.sql')).toBe(
        'dbs/iam/__views__/view1.sql',
      );
      expect(gd.getTableDataPath('iam', 'users')).toBe('dbs/iam/users.data.json');
      expect(gd.getInsightsPath('iam', 'users')).toBe(
        'dbs/iam/users.insights.gitlog',
      );
      expect(gd.getTableDataUrl('iam', 'users')).toBe(
        'https://github.com/db-man/db/blob/main/dbs/iam/users.data.json',
      );
    });

    it('should build a row path for a numeric and a string primary key', () => {
      expect(gd.getRowPath('iam', 'users', 1)).toBe('dbs/iam/users/1.json');
      expect(gd.getRowPath('iam', 'users', 'abc')).toBe(
        'dbs/iam/users/abc.json',
      );
    });

    it('should sanitize a primary key that is not filename safe', () => {
      expect(gd.getRowPath('iam', 'users', 'a/b c')).toBe(
        'dbs/iam/users/a_b_c.json',
      );
    });
  });

  describe('getTableSchema', () => {
    it('should find a table by name', () => {
      expect(gd.getTableSchema('iam', 'users')).toEqual({
        name: 'users',
        large: true,
        columns: [
          { id: 'userId', name: 'User ID', type: 'NUMBER', primary: true },
          { id: 'name', name: 'Name', type: 'STRING' },
        ],
      });
    });

    it('should return undefined when the table is unknown', () => {
      expect(gd.getTableSchema('iam', 'nope')).toBeUndefined();
    });

    it('should throw when the db is unknown', () => {
      expect(() => gd.getTableSchema('unknown', 'users')).toThrow(
        'this.dbsSchema is invalid!',
      );
    });
  });

  describe('getPrimaryKeyColumn', () => {
    it('should return the column marked primary', () => {
      expect(gd.getPrimaryKeyColumn('iam', 'roles')).toEqual({
        id: 'code',
        name: 'Code',
        type: 'STRING',
        primary: true,
      });
    });

    it('should throw when the table is unknown', () => {
      expect(() => gd.getPrimaryKeyColumn('iam', 'nope')).toThrow(
        'Table not found in dbsSchema, dbName: iam, tableName: nope.',
      );
    });

    // Not "return undefined and let the caller sort it out": a row with no
    // primary column has no identity, and every row-level entry needs one.
    it('should throw when no column is primary', () => {
      expect(() => gd.getPrimaryKeyColumn('iam', 'nopk')).toThrow(
        'No column is marked primary: true, dbName: iam, tableName: nopk.',
      );
    });
  });

  describe('isLargeTable', () => {
    it('should be true for a large table and falsy for a normal one', () => {
      expect(gd.isLargeTable('iam', 'users')).toBe(true);
      // a table without an explicit `large` field returns undefined, not false
      expect(gd.isLargeTable('iam', 'roles')).toBeFalsy();
    });

    it('should be false when the table is unknown', () => {
      expect(gd.isLargeTable('iam', 'nope')).toBe(false);
    });
  });

  describe('getTableRows', () => {
    it('should read a normal table through getFileContentAndSha', async () => {
      const controller = new AbortController();
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ id: 1 }],
        sha: 's1',
      });

      const res = await gd.getTableRows('iam', 'roles', controller.signal);

      expect(mockGithub.getFileContentAndSha).toHaveBeenCalledWith(
        'dbs/iam/roles.data.json',
        controller.signal,
      );
      expect(res).toEqual({ content: [{ id: 1 }], sha: 's1' });
      // the normal path must not touch the blob API
      expect(mockGithub.listDir).not.toHaveBeenCalled();
      expect(mockGithub.getBlobContentAndSha).not.toHaveBeenCalled();
    });

    it('should read a large table through the blob API', async () => {
      mockGithub.listDir.mockResolvedValueOnce([
        { name: 'roles.data.json', sha: 'other' },
        { name: 'users.data.json', sha: 'abc123' },
      ]);
      mockGithub.getBlobContentAndSha.mockResolvedValueOnce({
        content: [{ id: 1 }],
        sha: 'abc123',
      });

      const res = await gd.getTableRows('iam', 'users');

      expect(mockGithub.listDir).toHaveBeenCalledWith('dbs/iam', undefined);
      expect(mockGithub.getBlobContentAndSha).toHaveBeenCalledWith(
        'abc123',
        undefined,
      );
      expect(res.sha).toBe('abc123');
    });
    // The "a dir path can turn out to be a file" rule used to be re-checked
    // here. listDir() owns it now and GithubV2.test.ts asserts it, so this
    // suite no longer repeats that check.
  });

  describe('getTableInsights', () => {
    it('should return the decoded git log text', async () => {
      const gitLog = 'abc123 2024-10-01\n1\t0\troles.data.json';
      mockGithub.getFileRawContent.mockResolvedValueOnce({
        content: toBase64(gitLog),
        sha: 's1',
      });

      const res = await gd.getTableInsights('iam', 'roles');

      expect(mockGithub.getFileRawContent).toHaveBeenCalledWith(
        'dbs/iam/roles.insights.gitlog',
        undefined,
      );
      expect(res).toBe(gitLog);
    });

    // The "a file path can turn out to be a dir" rule used to be re-checked
    // here. getFileRawContent() owns it now and GithubV2.test.ts asserts it.

    it('should throw when the response carries no content', async () => {
      mockGithub.getFileRawContent.mockResolvedValueOnce({
        name: 'roles.insights.gitlog',
        sha: 's1',
      });

      await expect(gd.getTableInsights('iam', 'roles')).rejects.toThrow(
        'getTableInsights failed, res.content is not in res, check the path param.',
      );
    });
  });

  describe('getRow', () => {
    // The primary column may be declared as NUMBER (see
    // packages/cli/__test_dbs_dir__/iam/dbcfg.json and Github.tt.ts, which uses
    // date.valueOf()). A numeric value is therefore a legal input, not a
    // caller mistake — do not "fix" these tests by passing a string.
    it('split-table: should read the record file of the row', async () => {
      gd = buildGithubDb('split-table');
      // One record file holds one row, so its content is an object — not the
      // array a table file holds.
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: { userId: 1744820403529 },
        sha: 'r2',
      });

      const res = await gd.getRow('iam', 'users', 1744820403529);

      expect(mockGithub.getFileContentAndSha).toHaveBeenCalledWith(
        'dbs/iam/users/1744820403529.json',
        undefined,
      );
      expect(res?.row).toEqual({ userId: 1744820403529 });
      // the whole table file is nobody's business in this mode
      expect(mockGithub.listDir).not.toHaveBeenCalled();
    });

    // "This row does not exist" is an answer to "read this row", not a failure
    // — and it has to read the same in both modes, which is the whole point of
    // the row API. In split-table the row *is* the record file, so a missing
    // file is simply the row being absent.
    it('split-table: should return null when the record file is not there', async () => {
      gd = buildGithubDb('split-table');
      mockGithub.getFileContentAndSha.mockRejectedValueOnce(
        createGithubError('NOT_FOUND', 'Failed to get content by path.'),
      );

      await expect(gd.getRow('iam', 'roles', 'ADMIN')).resolves.toBeNull();
    });

    it('split-table: should not swallow any other failure', async () => {
      gd = buildGithubDb('split-table');
      const forbidden = createGithubError('FORBIDDEN', 'file too large');
      mockGithub.getFileContentAndSha.mockRejectedValueOnce(forbidden);

      await expect(gd.getRow('iam', 'roles', 'ADMIN')).rejects.toBe(forbidden);
    });

    it('normal: should find the row in the table file', async () => {
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ code: 'ADMIN' }, { code: 'GUEST' }],
        sha: 't1',
      });

      const res = await gd.getRow('iam', 'roles', 'GUEST');

      expect(mockGithub.getFileContentAndSha).toHaveBeenCalledWith(
        'dbs/iam/roles.data.json',
        undefined,
      );
      expect(res?.row).toEqual({ code: 'GUEST' });
    });

    // ?userId=1 hands over the string '1' while the data file holds the number
    // 1. `===` would report the row as missing.
    it('normal: should match a numeric primary key against its string form', async () => {
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ code: 1, name: 'John' }],
        sha: 't1',
      });

      const res = await gd.getRow('iam', 'roles', '1');

      expect(res?.row).toEqual({ code: 1, name: 'John' });
    });

    it('normal: should return null when the table holds no such row', async () => {
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ code: 'ADMIN' }],
        sha: 't1',
      });

      await expect(gd.getRow('iam', 'roles', 'NOPE')).resolves.toBeNull();
    });

    // A missing table is a misconfigured table, not an empty one: only "this
    // row is not there" reads as null.
    it('normal: should keep throwing when the table file itself is missing', async () => {
      mockGithub.getFileContentAndSha.mockRejectedValueOnce(
        createGithubError('NOT_FOUND', 'Failed to get content by path.'),
      );

      await expect(gd.getRow('iam', 'roles', 'ADMIN')).rejects.toMatchObject({
        type: 'NOT_FOUND',
      });
    });
  });

  describe('getDbViewScriptFileContentAndSha', () => {
    it('should read the view script as plain text', async () => {
      mockGithub.getPlainTextByPath.mockResolvedValueOnce('return [];');

      const res = await gd.getDbViewScriptFileContentAndSha('iam', 'view1.sql');

      expect(mockGithub.getPlainTextByPath).toHaveBeenCalledWith(
        'dbs/iam/__views__/view1.sql',
        undefined,
      );
      expect(res).toBe('return [];');
    });
  });

  describe('updateTableFile', () => {
    it('should save the table file with 1-space indentation and the db-man message', async () => {
      const data = { commit: { sha: 'c1' } };
      mockGithub.saveFile.mockResolvedValueOnce(data);

      const rows = [{ id: 1 }, { id: 2 }];
      const res = await gd.updateTableFile('iam', 'users', rows, 'old-sha');

      // 1 space, deliberately not 2 — this is the on-disk format of table files
      expect(mockGithub.saveFile.mock.calls[0][0].content).toBe(
        '[\n {\n  "id": 1\n },\n {\n  "id": 2\n }\n]',
      );
      expect(mockGithub.saveFile).toHaveBeenCalledWith({
        path: 'dbs/iam/users.data.json',
        content: JSON.stringify(rows, null, 1),
        message: '[db-man] Update table file (iam/users)',
        sha: 'old-sha',
      });
      expect(mockGithub.createFile).not.toHaveBeenCalled();
      expect(res).toBe(data);
    });

    // The sha is what decides create vs overwrite, so a caller that has none
    // must land on createFile — not on a save with an undefined sha.
    it('should create the table file when the caller has no sha', async () => {
      const rows = [{ id: 1 }];

      await gd.updateTableFile('iam', 'users', rows, undefined);

      expect(mockGithub.createFile).toHaveBeenCalledWith({
        path: 'dbs/iam/users.data.json',
        content: JSON.stringify(rows, null, 1),
        message: '[db-man] Update table file (iam/users)',
      });
      expect(mockGithub.saveFile).not.toHaveBeenCalled();
    });
  });

  describe('insertRow', () => {
    it('split-table: should create the record file and say which mode ran', async () => {
      gd = buildGithubDb('split-table');
      const data = { commit: { html_url: 'https://github.com/c/1' } };
      mockGithub.createFile.mockResolvedValueOnce(data);

      // the primary key is not the first field, and the file name must still
      // come from it
      const res = await gd.insertRow('iam', 'roles', {
        name: 'Administrator',
        code: 'ADMIN',
      });

      // 2 spaces is the on-disk format of record files — not the 1 space that
      // table files use, and not a reformatting of GitHub's own default
      expect(mockGithub.createFile).toHaveBeenCalledWith({
        path: 'dbs/iam/roles/ADMIN.json',
        content: '{\n  "name": "Administrator",\n  "code": "ADMIN"\n}',
        message: '[db-man] Create record file (iam/roles)',
      });
      expect(res).toEqual({ ...data, mode: 'split-table', action: 'insert' });
      // one small file: the table file is not read, let alone rewritten
      expect(mockGithub.getFileContentAndSha).not.toHaveBeenCalled();
      expect(mockGithub.saveFile).not.toHaveBeenCalled();
    });

    it('split-table: should let "the record file is already there" through as ALREADY_EXISTS', async () => {
      gd = buildGithubDb('split-table');
      const upstream = createGithubError(
        'ALREADY_EXISTS',
        "Invalid request.\n\nsha wasn't supplied",
      );
      mockGithub.createFile.mockRejectedValueOnce(upstream);

      // Deliberately not re-labelled DUPLICATE_KEY: record file names are
      // sanitized, so "this file exists" is not the same claim as "this key
      // exists".
      await expect(
        gd.insertRow('iam', 'roles', { code: 'ADMIN' }),
      ).rejects.toBe(upstream);
    });

    it('normal: should append to the table file and write with the sha it read', async () => {
      const data = { commit: { html_url: 'https://github.com/c/2' } };
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ code: 'ADMIN' }],
        sha: 't1',
      });
      mockGithub.saveFile.mockResolvedValueOnce(data);

      const res = await gd.insertRow('iam', 'roles', { code: 'GUEST' });

      expect(mockGithub.saveFile).toHaveBeenCalledWith({
        path: 'dbs/iam/roles.data.json',
        content: JSON.stringify([{ code: 'ADMIN' }, { code: 'GUEST' }], null, 1),
        message: '[db-man] Update table file (iam/roles)',
        sha: 't1',
      });
      expect(res).toEqual({ ...data, mode: 'normal', action: 'insert' });
    });

    it('normal: should refuse a duplicate primary key without writing anything', async () => {
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ code: 'ADMIN' }],
        sha: 't1',
      });

      const err = await gd
        .insertRow('iam', 'roles', { code: 'ADMIN' })
        .catch((e) => e);

      expect(isGithubError(err)).toBe(true);
      expect(err.type).toBe('DUPLICATE_KEY');
      // found by scanning the array — no HTTP, and nothing half-written
      expect(mockGithub.saveFile).not.toHaveBeenCalled();
      expect(mockGithub.createFile).not.toHaveBeenCalled();
    });

    it('normal: should compare a numeric primary key against its string form', async () => {
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ code: 1 }],
        sha: 't1',
      });

      const err = await gd
        .insertRow('iam', 'roles', { code: '1' })
        .catch((e) => e);

      expect(err.type).toBe('DUPLICATE_KEY');
    });

    it('should throw when the table has no primary column', async () => {
      await expect(gd.insertRow('iam', 'nopk', { x: 'a' })).rejects.toThrow(
        'No column is marked primary: true, dbName: iam, tableName: nopk.',
      );
    });
  });

  describe('updateRow', () => {
    it('split-table: should write the record file with the sha getRow handed out', async () => {
      gd = buildGithubDb('split-table');
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: { code: 'ADMIN' },
        sha: 'r1',
      });
      const data = { commit: { html_url: 'https://github.com/c/3' } };
      mockGithub.saveFile.mockResolvedValueOnce(data);

      const { rev } = (await gd.getRow('iam', 'roles', 'ADMIN'))!;
      const res = await gd.updateRow(
        'iam',
        'roles',
        'ADMIN',
        { code: 'ADMIN', name: 'Admin' },
        rev,
      );

      expect(mockGithub.saveFile).toHaveBeenCalledWith({
        path: 'dbs/iam/roles/ADMIN.json',
        content: '{\n  "code": "ADMIN",\n  "name": "Admin"\n}',
        message: '[db-man] Update record file (iam/roles)',
        sha: 'r1',
      });
      expect(res).toEqual({ ...data, mode: 'split-table', action: 'update' });
    });

    it('normal: should overwrite with the sha read at getRow time, not the fresh one', async () => {
      mockGithub.getFileContentAndSha
        .mockResolvedValueOnce({
          content: [{ code: 'ADMIN', name: 'old' }],
          sha: 'sha-at-read',
        })
        .mockResolvedValueOnce({
          content: [{ code: 'ADMIN', name: 'old' }],
          sha: 'sha-right-now',
        });
      mockGithub.saveFile.mockResolvedValueOnce({ commit: { html_url: 'u' } });

      const { rev } = (await gd.getRow('iam', 'roles', 'ADMIN'))!;
      await gd.updateRow(
        'iam',
        'roles',
        'ADMIN',
        { code: 'ADMIN', name: 'new' },
        rev,
      );

      // Writing with the sha just read would silently drop the "nobody touched
      // this since I read it" guard — a CONFLICT would become impossible.
      expect(mockGithub.saveFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'dbs/iam/roles.data.json',
          content: JSON.stringify([{ code: 'ADMIN', name: 'new' }], null, 1),
          sha: 'sha-at-read',
        }),
      );
    });

    it('normal: should refuse when the row is gone from the table', async () => {
      mockGithub.getFileContentAndSha
        .mockResolvedValueOnce({ content: [{ code: 'ADMIN' }], sha: 's1' })
        .mockResolvedValueOnce({ content: [{ code: 'GUEST' }], sha: 's2' });

      const { rev } = (await gd.getRow('iam', 'roles', 'ADMIN'))!;
      const err = await gd
        .updateRow('iam', 'roles', 'ADMIN', { code: 'ADMIN' }, rev)
        .catch((e) => e);

      expect(isGithubError(err)).toBe(true);
      expect(err.type).toBe('ROW_NOT_FOUND');
      expect(mockGithub.saveFile).not.toHaveBeenCalled();
    });

    it('should refuse a rev that was read in the other mode', async () => {
      const splitDb = buildGithubDb('split-table');
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: { code: 'ADMIN' },
        sha: 'r1',
      });
      const { rev } = (await splitDb.getRow('iam', 'roles', 'ADMIN'))!;

      // `gd` is normal mode, so this rev describes a record file — using it
      // against the table file would fail as a 409 far from the cause.
      await expect(
        gd.updateRow('iam', 'roles', 'ADMIN', { code: 'ADMIN' }, rev),
      ).rejects.toThrow(
        "Row revision was read in 'split-table' mode but this database is 'normal'",
      );
    });

    // Neither mode would do the same thing with a renamed key: split-table
    // would leave the old record file behind and add a second one, normal mode
    // would move the row in place. Refuse instead of picking one.
    it('should refuse to change the primary key', async () => {
      gd = buildGithubDb('split-table');
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: { code: 'ADMIN' },
        sha: 'r1',
      });
      const { rev } = (await gd.getRow('iam', 'roles', 'ADMIN'))!;

      await expect(
        gd.updateRow('iam', 'roles', 'ADMIN', { code: 'ROOT' }, rev),
      ).rejects.toThrow('changing a primary key is a delete plus an insert');
      expect(mockGithub.saveFile).not.toHaveBeenCalled();
    });
  });

  describe('deleteRow', () => {
    it('split-table: should delete the record file with the sha getRow handed out', async () => {
      gd = buildGithubDb('split-table');
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: { code: 'ADMIN' },
        sha: 'r1',
      });
      const data = { commit: { html_url: 'https://github.com/c/4' } };
      mockGithub.deleteFile.mockResolvedValueOnce(data);

      const { rev } = (await gd.getRow('iam', 'roles', 'ADMIN'))!;
      const res = await gd.deleteRow('iam', 'roles', 'ADMIN', rev);

      expect(mockGithub.deleteFile).toHaveBeenCalledWith({
        path: 'dbs/iam/roles/ADMIN.json',
        sha: 'r1',
        message: '[db-man] Delete file (iam/roles)',
      });
      expect(res).toEqual({ ...data, mode: 'split-table', action: 'delete' });
    });

    it('normal: should rewrite the table file without that row', async () => {
      mockGithub.getFileContentAndSha
        .mockResolvedValueOnce({
          content: [{ code: 'ADMIN' }, { code: 'GUEST' }],
          sha: 's1',
        })
        .mockResolvedValueOnce({
          content: [{ code: 'ADMIN' }, { code: 'GUEST' }],
          sha: 's2',
        });
      mockGithub.saveFile.mockResolvedValueOnce({ commit: { html_url: 'u' } });

      const { rev } = (await gd.getRow('iam', 'roles', 'GUEST'))!;
      await gd.deleteRow('iam', 'roles', 'GUEST', rev);

      expect(mockGithub.saveFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'dbs/iam/roles.data.json',
          content: JSON.stringify([{ code: 'ADMIN' }], null, 1),
          sha: 's1',
        }),
      );
      // deleting the file is not how a row disappears from a table
      expect(mockGithub.deleteFile).not.toHaveBeenCalled();
    });

    // The last row leaving does not make the table stop existing: the file is
    // still there, holding an empty array.
    it('normal: should write an empty array rather than delete the table file', async () => {
      mockGithub.getFileContentAndSha
        .mockResolvedValueOnce({ content: [{ code: 'ADMIN' }], sha: 's1' })
        .mockResolvedValueOnce({ content: [{ code: 'ADMIN' }], sha: 's2' });
      mockGithub.saveFile.mockResolvedValueOnce({ commit: { html_url: 'u' } });

      const { rev } = (await gd.getRow('iam', 'roles', 'ADMIN'))!;
      await gd.deleteRow('iam', 'roles', 'ADMIN', rev);

      expect(mockGithub.saveFile).toHaveBeenCalledWith(
        expect.objectContaining({ content: '[]' }),
      );
      expect(mockGithub.deleteFile).not.toHaveBeenCalled();
    });

    it('normal: should refuse when the row is not in the table', async () => {
      // Still there when getRow read it, gone by the time the write re-reads
      // the table — somebody else deleted it in between.
      mockGithub.getFileContentAndSha
        .mockResolvedValueOnce({ content: [{ code: 'ADMIN' }], sha: 's1' })
        .mockResolvedValueOnce({ content: [{ code: 'GUEST' }], sha: 's2' });

      const { rev } = (await gd.getRow('iam', 'roles', 'ADMIN'))!;
      const err = await gd
        .deleteRow('iam', 'roles', 'ADMIN', rev)
        .catch((e) => e);

      expect(err.type).toBe('ROW_NOT_FOUND');
      expect(mockGithub.saveFile).not.toHaveBeenCalled();
    });
  });

  describe('createDatabaseSchema', () => {
    it('should create dbcfg.json without a sha and with 2-space indentation', async () => {
      const schema = { name: 'iam', description: 'iam db', tables: [] };

      await gd.createDatabaseSchema(schema);

      expect(mockGithub.createFile).toHaveBeenCalledWith({
        path: 'dbs/iam/dbcfg.json',
        content: JSON.stringify(schema, null, '  '),
        message: '[db-man] Create database schema (iam)',
      });
    });
  });

  describe('updateDatabaseSchema', () => {
    it('should update dbcfg.json and pass the sha through', async () => {
      const schema = { name: 'iam', description: 'iam db', tables: [] };

      await gd.updateDatabaseSchema(schema, 'cfg-sha');

      expect(mockGithub.saveFile).toHaveBeenCalledWith({
        path: 'dbs/iam/dbcfg.json',
        content: JSON.stringify(schema, null, '  '),
        message: '[db-man] Update database schema (iam)',
        sha: 'cfg-sha',
      });
    });
  });

  describe('createTableSchema', () => {
    it('should append the new table to dbcfg.json using the sha it read back', async () => {
      const existingTable = { name: 'users', columns: [] };
      const dbCfg = {
        name: 'iam',
        description: 'iam db',
        tables: [existingTable],
      };
      mockGithub.getFileRawContent.mockResolvedValueOnce({
        content: toBase64(JSON.stringify(dbCfg)),
        sha: 'cfg-sha',
      });

      const newTable = { name: 'roles', columns: [] };
      await gd.createTableSchema('iam', newTable);

      expect(mockGithub.getFileRawContent).toHaveBeenCalledWith(
        'dbs/iam/dbcfg.json',
      );
      expect(mockGithub.saveFile).toHaveBeenCalledWith({
        path: 'dbs/iam/dbcfg.json',
        content: JSON.stringify(
          { ...dbCfg, tables: [existingTable, newTable] },
          null,
          '  ',
        ),
        message: '[db-man] Create table schema (roles)',
        sha: 'cfg-sha',
      });
    });
  });

  describe('getDbTablesSchema', () => {
    it('should return the content of dbcfg.json', async () => {
      const dbCfg = { name: 'iam', description: 'iam db', tables: [] };
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: dbCfg,
        sha: 'cfg-sha',
      });

      const res = await gd.getDbTablesSchema('iam');

      expect(mockGithub.getFileContentAndSha).toHaveBeenCalledWith(
        'dbs/iam/dbcfg.json',
      );
      expect(res).toEqual(dbCfg);
    });
  });

  describe('getDbTablesSchemaV2', () => {
    it('should return the parsed object together with the sha', async () => {
      const dbCfg = { name: 'iam', description: 'iam db', tables: [] };
      mockGithub.getFileRawContent.mockResolvedValueOnce({
        content: toBase64(JSON.stringify(dbCfg)),
        sha: 'cfg-sha',
      });

      const res = await gd.getDbTablesSchemaV2('iam');

      expect(mockGithub.getFileRawContent).toHaveBeenCalledWith(
        'dbs/iam/dbcfg.json',
      );
      expect(res).toEqual({ obj: dbCfg, sha: 'cfg-sha' });
    });

    it('should throw when dbcfg.json has no content', async () => {
      mockGithub.getFileRawContent.mockResolvedValueOnce({
        name: 'dbcfg.json',
        sha: 'cfg-sha',
      });

      await expect(gd.getDbTablesSchemaV2('iam')).rejects.toThrow(
        'getDbTablesSchemaV2Async failed, file content is empty.',
      );
    });
  });
});
