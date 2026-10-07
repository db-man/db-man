import { Github } from '@db-man/github';
import type { MessageInstance } from 'antd/es/message/interface';

import * as constants from '../../constants';
import { errMsg } from '../../utils';

import { reloadDbsSchemaAsync, saveConnectionToLocalStorage } from './helpers';

// `reloadDbsSchemaAsync` builds its own client with `new Github(...)`, so the
// value has to be injected through a module mock. There is nothing to pass in.
jest.mock('@db-man/github', () => ({
  Github: jest.fn(),
}));

// `errMsg` is the canonical way this module reports a failure, and it also
// writes to the console. Mock it so the error paths stay quiet and countable.
jest.mock('../../utils', () => ({
  errMsg: jest.fn(),
}));

const GithubMock = Github as unknown as jest.Mock;
const errMsgMock = errMsg as unknown as jest.Mock;

const makeMessageApi = () =>
  ({
    info: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    success: jest.fn(),
  } as unknown as MessageInstance);

/** Wire `new Github(...)` to a fake client and return it. */
const makeGithub = () => {
  const client = {
    getDbsCfg: jest.fn(),
    getContentByPath: jest.fn(),
    getFileContentAndSha: jest.fn(),
  };
  GithubMock.mockImplementation(() => client);
  return client;
};

const table = {
  name: 'users',
  columns: [{ id: 'userId', name: 'User ID', type: 'STRING' }],
};
const dbSchema = { name: 'iam', description: 'iam desc', tables: [table] };

const resolveSchema = (github: ReturnType<typeof makeGithub>, db: unknown) => {
  github.getDbsCfg.mockResolvedValue({
    content: { repoPath: 'dbs', dbModes: 'split-table' },
  });
  github.getContentByPath.mockResolvedValue([{ name: 'iam' }]);
  github.getFileContentAndSha.mockResolvedValue({ content: db, sha: 'sha1' });
};

describe('saveConnectionToLocalStorage', () => {
  it('should write the token, the owner and the repo name', () => {
    saveConnectionToLocalStorage('tok', 'owner1', 'repo1');

    expect(
      localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN)
    ).toBe('tok');
    expect(localStorage.getItem(constants.LS_KEY_GITHUB_OWNER)).toBe('owner1');
    expect(localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME)).toBe(
      'repo1'
    );
  });
});

describe('reloadDbsSchemaAsync', () => {
  beforeEach(() => {
    localStorage.clear();
    // The success path schedules `window.location.reload()` in 3s.
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should build the client from the given connection details', async () => {
    const github = makeGithub();
    resolveSchema(github, dbSchema);

    await reloadDbsSchemaAsync('tok', 'owner', 'repo', makeMessageApi());

    expect(GithubMock).toHaveBeenCalledWith({
      personalAccessToken: 'tok',
      owner: 'owner',
      repoName: 'repo',
    });
  });

  it('should report an error when dbs.json cannot be read', async () => {
    const github = makeGithub();
    github.getDbsCfg.mockRejectedValue(new Error('boom'));
    const messageApi = makeMessageApi();

    await reloadDbsSchemaAsync('tok', 'owner', 'repo', messageApi);

    expect(errMsgMock).toHaveBeenCalledWith(
      expect.stringContaining('Failed to get dbs.json! Reason: boom')
    );
    expect(github.getContentByPath).not.toHaveBeenCalled();
    expect(localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH)).toBeNull();
  });

  it('should stop when dbs.json carries no repoPath', async () => {
    const github = makeGithub();
    github.getDbsCfg.mockResolvedValue({ content: { dbModes: 'split-table' } });

    await reloadDbsSchemaAsync('tok', 'owner', 'repo', makeMessageApi());

    expect(errMsgMock).toHaveBeenCalledWith(
      'Repo path not found in dbs.json!'
    );
    expect(github.getContentByPath).not.toHaveBeenCalled();
    expect(localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)).toBeNull();
  });

  it('should stop when dbs.json carries no dbModes', async () => {
    const github = makeGithub();
    github.getDbsCfg.mockResolvedValue({ content: { repoPath: 'dbs' } });

    await reloadDbsSchemaAsync('tok', 'owner', 'repo', makeMessageApi());

    expect(errMsgMock).toHaveBeenCalledWith(
      'DB modes not found in dbs.json!'
    );
    expect(github.getContentByPath).not.toHaveBeenCalled();
    expect(localStorage.getItem(constants.LS_KEY_DBS_SCHEMA)).toBeNull();
  });

  it('should save the schema and announce the reload', async () => {
    const github = makeGithub();
    resolveSchema(github, dbSchema);
    const messageApi = makeMessageApi();

    await reloadDbsSchemaAsync('tok', 'owner', 'repo', messageApi);

    expect(github.getContentByPath).toHaveBeenCalledWith('dbs');
    expect(github.getFileContentAndSha).toHaveBeenCalledWith(
      'dbs/iam/dbcfg.json'
    );
    expect(localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH)).toBe('dbs');
    expect(localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)).toBe(
      'split-table'
    );
    expect(
      JSON.parse(localStorage.getItem(constants.LS_KEY_DBS_SCHEMA) as string)
    ).toEqual({ iam: dbSchema });
    expect(messageApi.info).toHaveBeenCalledWith(
      'Finish loading DBs schema! Will reload window in 3s!'
    );
    expect(messageApi.error).not.toHaveBeenCalled();
  });

  it('should explain a missing dbcfg.json when GitHub answers 404', async () => {
    const github = makeGithub();
    resolveSchema(github, dbSchema);
    github.getFileContentAndSha.mockRejectedValue(
      Object.assign(new Error('Not Found'), { cause: { status: 404 } })
    );

    await reloadDbsSchemaAsync('tok', 'owner', 'repo', makeMessageApi());

    expect(errMsgMock).toHaveBeenCalledWith(
      expect.stringContaining(
        'Database config file dbcfg.json not found for database "iam"'
      ),
      expect.anything()
    );
    expect(localStorage.getItem(constants.LS_KEY_DBS_SCHEMA)).toBeNull();
  });

  it('should pass on the raw error when GitHub fails for another reason', async () => {
    const github = makeGithub();
    resolveSchema(github, dbSchema);
    github.getFileContentAndSha.mockRejectedValue(new Error('rate limited'));

    await reloadDbsSchemaAsync('tok', 'owner', 'repo', makeMessageApi());

    expect(errMsgMock).toHaveBeenCalledWith(
      expect.stringContaining('Failed to get DB schema! rate limited'),
      expect.anything()
    );
  });

  describe('schema validation', () => {
    const invalidSchemas: { label: string; db: unknown }[] = [
      {
        label: 'a missing database name',
        db: { ...dbSchema, name: '' },
      },
      {
        label: 'a missing database description',
        db: { ...dbSchema, description: '' },
      },
      {
        label: 'a table without a name',
        db: { ...dbSchema, tables: [{ ...table, name: '' }] },
      },
      {
        label: 'a column without an id',
        db: {
          ...dbSchema,
          tables: [{ ...table, columns: [{ ...table.columns[0], id: '' }] }],
        },
      },
      {
        label: 'a column without a name',
        db: {
          ...dbSchema,
          tables: [{ ...table, columns: [{ ...table.columns[0], name: '' }] }],
        },
      },
      {
        label: 'a column without a type',
        db: {
          ...dbSchema,
          tables: [{ ...table, columns: [{ ...table.columns[0], type: '' }] }],
        },
      },
    ];

    invalidSchemas.forEach(({ label, db }) => {
      it(`should refuse to save a schema with ${label}`, async () => {
        const github = makeGithub();
        resolveSchema(github, db);
        const messageApi = makeMessageApi();

        await reloadDbsSchemaAsync('tok', 'owner', 'repo', messageApi);

        expect(messageApi.error).toHaveBeenCalledWith(
          'DB schema is invalid! Will not save to localStorage!'
        );
        expect(localStorage.getItem(constants.LS_KEY_DBS_SCHEMA)).toBeNull();
      });
    });

    it('should throw instead of reporting a table without a columns field', async () => {
      // Known bug: the guard pushes "Missing table columns", but the next line
      // calls `table.columns.forEach` anyway, so a table without the field
      // never gets its error message - it blows up with a TypeError first.
      const github = makeGithub();
      resolveSchema(github, {
        ...dbSchema,
        tables: [{ name: 'users' }],
      });

      await expect(
        reloadDbsSchemaAsync('tok', 'owner', 'repo', makeMessageApi())
      ).rejects.toThrow(TypeError);
    });
  });
});
