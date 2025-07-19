import { exec } from 'child_process';

import { getChangedDbTables, getChangedFilesBySha } from './utils.mjs';

// Mock the child_process module
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

describe('getChangedFilesBySha', () => {
  it('should return proper value', async () => {
    /**
     * Mock implementation of exec
     * Why we need to mock the exec? Because on GitHub action, when git clone the repo, the depth is 1, so the given sha is not in the history
     * So the real git command will fail with "fatal: bad object 8a44b1f55509cd033fd9ac000c218c623f21f6d4"
     */
    exec.mockImplementation((cmd, callback) => {
      // why after `2.json` is a new line? Because the real git command will return a new line after each file path
      callback(
        null,
        `packages/cli/__test_dbs_dir__/iam/roles/developer.json
packages/cli/__test_dbs_dir__/iam/users/2.json
`,
        ''
      );
    });

    const actual = await getChangedFilesBySha(
      '8a44b1f55509cd033fd9ac000c218c623f21f6d4'
    );
    expect(actual).toEqual([
      'packages/cli/__test_dbs_dir__/iam/roles/developer.json',
      'packages/cli/__test_dbs_dir__/iam/users/2.json',
    ]);
  });

  it('should handle git command failure', async () => {
    // Mock implementation of exec for failure scenario
    exec.mockImplementation((cmd, callback) => {
      callback(new Error('Command failed'), '', 'fatal: bad object');
    });

    await expect(getChangedFilesBySha('invalid-sha')).rejects.toThrow(
      'Command failed'
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error executing git:')
    );
  });

  it('should handle git stderr', async () => {
    // Mock implementation of exec for stderr scenario
    exec.mockImplementation((cmd, callback) => {
      callback(null, '', 'fatal: bad object');
    });

    await expect(getChangedFilesBySha('invalid-sha')).rejects.toThrow(
      'fatal: bad object'
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Git stderr: fatal: bad object')
    );
  });
});

// get changed db tables from git log
describe('getChangedDbTables', () => {
  it('should return proper value when record files changed', async () => {
    const actual = await getChangedDbTables([
      'db_files_dir/iam/users/789900000005.json',
      'db_files_dir/iam/users/789900000006.json',
    ]);
    expect(actual).toEqual(['iam/users']);
  });

  it('should return proper value when multiple records from different tables changed', async () => {
    const actual = await getChangedDbTables([
      'db_files_dir/iam/users/789900000005.json',
      'db_files_dir/iam/roles/developer.json',
    ]);
    expect(actual).toEqual(['iam/users', 'iam/roles']);
  });

  it('should return proper value when table files changed', async () => {
    const actual = await getChangedDbTables([
      'db_files_dir/iam/users.data.json',
      'db_files_dir/iam/roles.data.json',
    ]);
    expect(actual).toEqual(['iam/users', 'iam/roles']);
  });
});
