import GithubDb from './GithubDb';
import Github from './Github';

jest.mock('./Github', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const MockedGithub = Github as unknown as jest.Mock;

/** GitHub hands file content back base64 encoded. */
const toBase64 = (value: string) => Buffer.from(value).toString('base64');

const mockDbsSchema = {
  iam: {
    name: 'iam',
    description: 'iam db',
    tables: [
      { name: 'users', large: true, columns: [] },
      { name: 'roles', columns: [] },
    ],
  },
};

/**
 * Every Github method GithubDb may reach for, in one place, so a new case can
 * never silently call an undefined method on the mock.
 */
const createMockGithub = () => ({
  getFileContentAndSha: jest.fn(),
  getContentByPath: jest.fn(),
  getBlobContentAndSha: jest.fn(),
  getPlainTextByPath: jest.fn(),
  updateFile: jest.fn(),
  deleteFile: jest.fn(),
});

describe('GithubDb', () => {
  let mockGithub: ReturnType<typeof createMockGithub>;
  let gd: GithubDb;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGithub = createMockGithub();
    MockedGithub.mockImplementation(() => mockGithub as any);
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    gd = new GithubDb({
      personalAccessToken: 'test-token',
      repoPath: 'dbs',
      owner: 'db-man',
      repoName: 'db',
      dbsSchema: mockDbsSchema,
    });
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
    };

    it('should throw when personalAccessToken is undefined', () => {
      expect(
        () =>
          new GithubDb({ ...valid, personalAccessToken: undefined as any }),
      ).toThrow('Input personalAccessToken is undefined or null!');
    });

    it('should throw when personalAccessToken is null', () => {
      expect(
        () => new GithubDb({ ...valid, personalAccessToken: null as any }),
      ).toThrow('Input personalAccessToken is undefined or null!');
    });

    it('should throw when repoPath is empty', () => {
      expect(() => new GithubDb({ ...valid, repoPath: '' })).toThrow(
        'Input repoPath is invalid!',
      );
    });

    it('should throw when dbsSchema is missing', () => {
      expect(
        () => new GithubDb({ ...valid, dbsSchema: undefined as any }),
      ).toThrow('Input dbsSchema is invalid!');
    });

    it('should throw when owner is empty', () => {
      expect(() => new GithubDb({ ...valid, owner: '' })).toThrow(
        'Input owner is invalid!',
      );
    });

    it('should throw when repoName is empty', () => {
      expect(() => new GithubDb({ ...valid, repoName: '' })).toThrow(
        'Input repoName is invalid!',
      );
    });

    it('should build a Github instance with the same credentials', () => {
      expect(MockedGithub).toHaveBeenCalledWith({
        personalAccessToken: 'test-token',
        owner: 'db-man',
        repoName: 'db',
      });
    });
  });

  describe('path helpers', () => {
    // These look like trivial string joins, but getDataPath() uses
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
      expect(gd.getDataPath('iam', 'users')).toBe('dbs/iam/users.data.json');
      expect(gd.getInsightsPath('iam', 'users')).toBe(
        'dbs/iam/users.insights.gitlog',
      );
      expect(gd.getDataUrl('iam', 'users')).toBe(
        'https://github.com/db-man/db/blob/main/dbs/iam/users.data.json',
      );
    });

    it('should build a record path for a numeric and a string primary key', () => {
      expect(gd.getRecordPath('iam', 'users', 1)).toBe('dbs/iam/users/1.json');
      expect(gd.getRecordPath('iam', 'users', 'abc')).toBe(
        'dbs/iam/users/abc.json',
      );
    });

    it('should sanitize a primary key that is not filename safe', () => {
      expect(gd.getRecordPath('iam', 'users', 'a/b c')).toBe(
        'dbs/iam/users/a_b_c.json',
      );
    });
  });

  describe('getTableSchema', () => {
    it('should find a table by name', () => {
      expect(gd.getTableSchema('iam', 'users')).toEqual({
        name: 'users',
        large: true,
        columns: [],
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
      expect(mockGithub.getContentByPath).not.toHaveBeenCalled();
    });

    it('should read a large table through the blob API', async () => {
      mockGithub.getContentByPath.mockResolvedValueOnce([
        { name: 'roles.data.json', sha: 'other' },
        { name: 'users.data.json', sha: 'abc123' },
      ]);
      mockGithub.getBlobContentAndSha.mockResolvedValueOnce({
        content: [{ id: 1 }],
        sha: 'abc123',
      });

      const res = await gd.getTableRows('iam', 'users');

      expect(mockGithub.getContentByPath).toHaveBeenCalledWith(
        'dbs/iam',
        undefined,
      );
      expect(mockGithub.getBlobContentAndSha).toHaveBeenCalledWith(
        'abc123',
        undefined,
      );
      expect(res.sha).toBe('abc123');
    });

    it('should throw when the large table directory resolves to a file', async () => {
      mockGithub.getContentByPath.mockResolvedValueOnce({ name: 'iam' });

      await expect(gd.getTableRows('iam', 'users')).rejects.toThrow(
        'Expected an array of files',
      );
    });
  });

  describe('getTableInsights', () => {
    it('should return the decoded git log text', async () => {
      const gitLog = 'abc123 2024-10-01\n1\t0\troles.data.json';
      mockGithub.getContentByPath.mockResolvedValueOnce({
        content: toBase64(gitLog),
        sha: 's1',
      });

      const res = await gd.getTableInsights('iam', 'roles');

      expect(mockGithub.getContentByPath).toHaveBeenCalledWith(
        'dbs/iam/roles.insights.gitlog',
        undefined,
      );
      expect(res).toBe(gitLog);
    });

    it('should throw when the insights path is a directory', async () => {
      mockGithub.getContentByPath.mockResolvedValueOnce([]);

      await expect(gd.getTableInsights('iam', 'roles')).rejects.toThrow(
        'getTableInsights failed, res is an array, the path param should be a file, not a dir.',
      );
    });

    it('should throw when the response carries no content', async () => {
      mockGithub.getContentByPath.mockResolvedValueOnce({
        name: 'roles.insights.gitlog',
        sha: 's1',
      });

      await expect(gd.getTableInsights('iam', 'roles')).rejects.toThrow(
        'getTableInsights failed, res.content is not in res, check the path param.',
      );
    });
  });

  describe('getRecordFileContentAndSha', () => {
    it('should read the record file for a string primary key', async () => {
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ code: 'ADMIN' }],
        sha: 'r1',
      });

      const res = await gd.getRecordFileContentAndSha('iam', 'roles', 'ADMIN');

      expect(mockGithub.getFileContentAndSha).toHaveBeenCalledWith(
        'dbs/iam/roles/ADMIN.json',
        undefined,
      );
      expect(res.sha).toBe('r1');
    });

    // The primary column may be declared as NUMBER (see
    // packages/cli/__test_dbs_dir__/iam/dbcfg.json and Github.tt.ts, which uses
    // date.valueOf()). A numeric value is therefore a legal input, not a
    // caller mistake — do not "fix" this test by passing a string.
    it('should read the record file for a numeric primary key', async () => {
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: [{ userId: 1744820403529 }],
        sha: 'r2',
      });

      const res = await gd.getRecordFileContentAndSha(
        'iam',
        'users',
        1744820403529,
      );

      expect(mockGithub.getFileContentAndSha).toHaveBeenCalledWith(
        'dbs/iam/users/1744820403529.json',
        undefined,
      );
      expect(res.sha).toBe('r2');
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
    it('should write the table file with 1-space indentation and the db-man message', async () => {
      const data = { commit: { sha: 'c1' } };
      mockGithub.updateFile.mockResolvedValueOnce(data);

      const rows = [{ id: 1 }, { id: 2 }];
      const res = await gd.updateTableFile('iam', 'users', rows, 'old-sha');

      // 1 space, deliberately not 2 — this is the on-disk format of table files
      expect(mockGithub.updateFile.mock.calls[0][0].content).toBe(
        '[\n {\n  "id": 1\n },\n {\n  "id": 2\n }\n]',
      );
      expect(mockGithub.updateFile).toHaveBeenCalledWith({
        path: 'dbs/iam/users.data.json',
        content: JSON.stringify(rows, null, 1),
        sha: 'old-sha',
        message: '[db-man] Update table file (iam/users)',
      });
      expect(res).toBe(data);
    });
  });

  describe('updateRecordFile', () => {
    it('should write the record file using the primary key value and 2-space indentation', async () => {
      const record = { id: 1, name: 'John' };

      await gd.updateRecordFile('iam', 'users', 'id', record, 'sha-1');

      expect(mockGithub.updateFile).toHaveBeenCalledWith({
        path: 'dbs/iam/users/1.json',
        content: '{\n  "id": 1,\n  "name": "John"\n}',
        sha: 'sha-1',
        message: '[db-man] Update record file (iam/users)',
      });
    });

    it('should use the value of the given primary key column, not the first field', async () => {
      const record = { name: 'John', id: 42 };

      await gd.updateRecordFile('iam', 'users', 'id', record, 'sha-1');

      expect(mockGithub.updateFile).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'dbs/iam/users/42.json' }),
      );
    });
  });

  describe('deleteRecordFile', () => {
    it('should delete the record file with the db-man message and the given sha', async () => {
      const data = { commit: { sha: 'c2' } };
      mockGithub.deleteFile.mockResolvedValueOnce(data);

      const res = await gd.deleteRecordFile('iam', 'users', 1, 'sha-1');

      expect(mockGithub.deleteFile).toHaveBeenCalledWith({
        path: 'dbs/iam/users/1.json',
        sha: 'sha-1',
        message: '[db-man] Delete file (iam/users)',
      });
      expect(res).toBe(data);
    });
  });

  describe('createDatabaseSchema', () => {
    it('should create dbcfg.json without a sha and with 2-space indentation', async () => {
      const schema = { name: 'iam', description: 'iam db', tables: [] };

      await gd.createDatabaseSchema(schema);

      expect(mockGithub.updateFile).toHaveBeenCalledWith({
        path: 'dbs/iam/dbcfg.json',
        content: JSON.stringify(schema, null, '  '),
        message: '[db-man] Create database schema (iam)',
        sha: undefined,
      });
    });
  });

  describe('updateDatabaseSchema', () => {
    it('should update dbcfg.json and pass the sha through', async () => {
      const schema = { name: 'iam', description: 'iam db', tables: [] };

      await gd.updateDatabaseSchema(schema, 'cfg-sha');

      expect(mockGithub.updateFile).toHaveBeenCalledWith({
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
      const dbCfg = { name: 'iam', description: 'iam db', tables: [existingTable] };
      mockGithub.getContentByPath.mockResolvedValueOnce({
        content: toBase64(JSON.stringify(dbCfg)),
        sha: 'cfg-sha',
      });

      const newTable = { name: 'roles', columns: [] };
      await gd.createTableSchema('iam', newTable);

      expect(mockGithub.getContentByPath).toHaveBeenCalledWith(
        'dbs/iam/dbcfg.json',
      );
      expect(mockGithub.updateFile).toHaveBeenCalledWith({
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

  describe('getDbTablesSchemaAsync', () => {
    it('should return the content of dbcfg.json', async () => {
      const dbCfg = { name: 'iam', description: 'iam db', tables: [] };
      mockGithub.getFileContentAndSha.mockResolvedValueOnce({
        content: dbCfg,
        sha: 'cfg-sha',
      });

      const res = await gd.getDbTablesSchemaAsync('iam');

      expect(mockGithub.getFileContentAndSha).toHaveBeenCalledWith(
        'dbs/iam/dbcfg.json',
      );
      expect(res).toEqual(dbCfg);
    });
  });

  describe('getDbTablesSchemaV2Async', () => {
    it('should return the parsed object together with the sha', async () => {
      const dbCfg = { name: 'iam', description: 'iam db', tables: [] };
      mockGithub.getContentByPath.mockResolvedValueOnce({
        content: toBase64(JSON.stringify(dbCfg)),
        sha: 'cfg-sha',
      });

      const res = await gd.getDbTablesSchemaV2Async('iam');

      expect(res).toEqual({ obj: dbCfg, sha: 'cfg-sha' });
    });

    it('should throw when dbcfg.json has no content', async () => {
      mockGithub.getContentByPath.mockResolvedValueOnce({
        name: 'dbcfg.json',
        sha: 'cfg-sha',
      });

      await expect(gd.getDbTablesSchemaV2Async('iam')).rejects.toThrow(
        'getDbTablesSchemaV2Async failed, file content is empty.',
      );
    });
  });
});
