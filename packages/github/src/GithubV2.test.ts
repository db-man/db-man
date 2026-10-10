import GithubV2 from './GithubV2';
import octokit from './octokit';

jest.mock('./octokit');

const mockedOctokitFactory = octokit as jest.MockedFunction<typeof octokit>;

// The three channels the class under test talks to. They are shaped
// differently: reads go through `request(url, params)`, writes through
// `rest.repos.*`. Both must exist on the mock, otherwise the write paths throw
// a TypeError that has nothing to do with the code under test.
const mockRequest = jest.fn();
const mockCreateOrUpdateFileContents = jest.fn();
const mockDeleteFile = jest.fn();

const CONTENT_URL = 'GET /repos/{owner}/{repo}/contents/{path}';
const BLOB_URL = 'GET /repos/{owner}/{repo}/git/blobs/{sha}';
const BOT = { name: 'db-man-bot', email: 'db-man-bot-email' };

/** GitHub hands file content back base64 encoded. */
const toBase64 = (value: string) => Buffer.from(value).toString('base64');

describe('GithubV2', () => {
  const g = new GithubV2({
    personalAccessToken: 'test-token',
    owner: 'db-man',
    repoName: 'db',
  });

  let consoleErrorSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest.mockReset();
    mockCreateOrUpdateFileContents.mockReset();
    mockDeleteFile.mockReset();

    mockedOctokitFactory.mockReturnValue({
      request: mockRequest,
      rest: {
        repos: {
          createOrUpdateFileContents: mockCreateOrUpdateFileContents,
          deleteFile: mockDeleteFile,
        },
      },
    } as any);

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe('constructor', () => {
    const valid = {
      personalAccessToken: 'test-token',
      owner: 'db-man',
      repoName: 'db',
    };

    it('should throw when personalAccessToken is undefined', () => {
      expect(
        () => new GithubV2({ ...valid, personalAccessToken: undefined }),
      ).toThrow('Input personalAccessToken is undefined or null!');
    });

    it('should throw when personalAccessToken is null', () => {
      expect(
        () => new GithubV2({ ...valid, personalAccessToken: null }),
      ).toThrow('Input personalAccessToken is undefined or null!');
    });

    it('should throw when owner is empty', () => {
      expect(() => new GithubV2({ ...valid, owner: '' })).toThrow(
        'Input owner is invalid!',
      );
    });

    it('should throw when repoName is empty', () => {
      expect(() => new GithubV2({ ...valid, repoName: '' })).toThrow(
        'Input repoName is invalid!',
      );
    });

    it('should expose the context it was built with', () => {
      const instance = new GithubV2(valid);

      expect(instance.context).toEqual(valid);
      expect(instance.getGitHubUrl('blob/main/dbs.json')).toBe(
        'https://github.com/db-man/db/blob/main/dbs.json',
      );
    });
  });

  describe('getRawContentByPath / listDir / getFileRawContent', () => {
    it('listDir: should return an array with the expected length when called with a directory path', async () => {
      mockRequest.mockResolvedValueOnce({
        data: [{ name: 'a.json' }, { name: 'b.json' }],
      });

      const data = await g.listDir('dbs/iam');

      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });

    it('listDir: should refuse a path that turns out to be a file', async () => {
      mockRequest.mockResolvedValueOnce({
        data: { name: 'dbcfg.json', sha: 's1' },
      });

      await expect(g.listDir('dbs/iam/dbcfg.json')).rejects.toThrow(
        'listDir failed, path is a file, not a dir, path: dbs/iam/dbcfg.json.',
      );
    });

    it('getFileRawContent: should return the raw file object when called with a file path', async () => {
      mockRequest.mockResolvedValueOnce({
        data: { name: 'dbcfg.json', content: 'eyJ0ZXN0Ijp0cnVlfQ==', sha: 's1' },
      });

      const data = await g.getFileRawContent('dbs/iam/dbcfg.json');

      expect(data.name).toBe('dbcfg.json');
      // content stays base64 here — decoding is the caller's job
      // (getFileContentAndSha / getPlainTextByPath do it for you)
      expect(data.content).toBe('eyJ0ZXN0Ijp0cnVlfQ==');
    });

    it('getFileRawContent: should refuse a path that turns out to be a dir', async () => {
      mockRequest.mockResolvedValueOnce({ data: [{ name: 'a.json' }] });

      await expect(g.getFileRawContent('dbs/iam')).rejects.toThrow(
        'getFileRawContent failed, path is a dir, not a file, path: dbs/iam.',
      );
    });

    it('should throw an error when calling getRawContentByPath with a non-existent path', async () => {
      mockRequest.mockRejectedValueOnce({ status: 404 });

      await expect(g.getRawContentByPath('non-existent-path')).rejects.toThrow(
        'path not found',
      );
    });

    // The four assertions below pin the URL template and the parameter names
    // that octokit receives, plus the error wording that consumers display.
    // If someone edits the template string in GithubV2.ts, or re-words an
    // error message, these fail even though the mock would accept anything.
    it('should call the contents endpoint with owner, repo, path and signal', async () => {
      mockRequest.mockResolvedValueOnce({ data: [] });

      await g.getRawContentByPath('dbs/iam');

      expect(mockRequest).toHaveBeenCalledWith(CONTENT_URL, {
        owner: 'db-man',
        repo: 'db',
        path: 'dbs/iam',
        request: { signal: undefined },
      });
    });

    it('should explain an invalid token when the API answers 401', async () => {
      const upstream = { status: 401, message: 'Bad credentials' };
      mockRequest.mockRejectedValueOnce(upstream);

      const err = await g.getRawContentByPath('dbs/iam').catch((e) => e);

      expect(err.message).toBe(
        'Failed to get content by path, maybe personal access token is invalid, path: dbs/iam.',
      );
      // the original error must be preserved for debugging
      expect(err.cause).toBe(upstream);
    });

    it('should explain an oversized file when the API answers 403', async () => {
      mockRequest.mockRejectedValueOnce({ status: 403 });

      await expect(
        g.getRawContentByPath('dbs/iam/users.data.json'),
      ).rejects.toThrow(
        'Failed to get content by path, maybe file too large, path: dbs/iam/users.data.json.',
      );
    });

    it('should fall back to a generic message for any other status', async () => {
      mockRequest.mockRejectedValueOnce({ status: 500 });

      await expect(g.getRawContentByPath('dbs/iam')).rejects.toThrow(
        'Failed to get content by path, unknow error, path: dbs/iam.',
      );
    });
  });

  describe('getContentByPathV2', () => {
    it('should return an array with a non-zero length when calling getContentByPathV2 with a directory path', async () => {
      mockRequest.mockResolvedValueOnce({
        data: [{ name: 'a.json' }, { name: 'b.json' }],
      });

      const data = await g.getContentByPathV2('dbs/iam');

      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });

    it('should return an error object when calling getContentByPathV2 with a non-existent path', async () => {
      mockRequest.mockRejectedValueOnce({ status: 404 });

      const [error, data] = await g.getContentByPathV2('non-existent-path');

      expect(error).toBeDefined();
      if (typeof error === 'object' && 'type' in error!) {
        expect(error.type).toBe('FileNotFound');
      } else {
        expect(true).toBe(false);
      }
      expect(data).toBeNull();
    });

    it('should report FileNoPermission when the API answers 403', async () => {
      mockRequest.mockRejectedValueOnce({ status: 403 });

      const [error, data] = await g.getContentByPathV2(
        'dbs/iam/users.data.json',
      );

      expect(error).toMatchObject({
        type: 'FileNoPermission',
        message: 'Failed to get file: file too large',
        url: 'https://github.com/db-man/db/dbs/iam/users.data.json',
      });
      expect(data).toBeNull();
    });

    it('should report FileUknownError for any other status', async () => {
      mockRequest.mockRejectedValueOnce({ status: 500 });

      const [error, data] = await g.getContentByPathV2('dbs/iam/dbcfg.json');

      expect(error).toMatchObject({ type: 'FileUknownError' });
      expect(data).toBeNull();
    });
  });

  describe('getFileContentAndSha', () => {
    it('should decode the file content and pass the sha through', async () => {
      const rows = [{ id: 1 }, { id: 2 }];
      mockRequest.mockResolvedValueOnce({
        data: {
          name: 'users.data.json',
          content: toBase64(JSON.stringify(rows)),
          sha: 's1',
        },
      });

      const res = await g.getFileContentAndSha('dbs/iam/users.data.json');

      expect(res.content).toEqual(rows);
      expect(res.sha).toBe('s1');
    });

    it('should forward the signal to the contents endpoint', async () => {
      const controller = new AbortController();
      mockRequest.mockResolvedValueOnce({
        data: { content: toBase64('[]'), sha: 's1' },
      });

      await g.getFileContentAndSha(
        'dbs/iam/users.data.json',
        controller.signal,
      );

      expect(mockRequest).toHaveBeenCalledWith(CONTENT_URL, {
        owner: 'db-man',
        repo: 'db',
        path: 'dbs/iam/users.data.json',
        request: { signal: controller.signal },
      });
    });

    it('should throw when the path points to a directory', async () => {
      mockRequest.mockResolvedValueOnce({ data: [{ name: 'a.json' }] });

      // The "path is a dir" rule moved down into getFileRawContent(), so this
      // caller no longer produces its own wording — it re-raises the shared one.
      await expect(g.getFileContentAndSha('dbs/iam')).rejects.toThrow(
        'getFileRawContent failed, path is a dir, not a file, path: dbs/iam.',
      );
    });

    it('should throw when the response carries no content', async () => {
      mockRequest.mockResolvedValueOnce({ data: { name: 'x', sha: 's1' } });

      await expect(
        g.getFileContentAndSha('dbs/iam/users.data.json'),
      ).rejects.toThrow(
        'getFileContentAndSha failed, res.content is not in res, check the path param.',
      );
    });
  });

  describe('getPlainTextByPath', () => {
    it('should return the decoded text as it is', async () => {
      mockRequest.mockResolvedValueOnce({
        data: { name: 'view1.sql', content: toBase64('select 1;'), sha: 's1' },
      });

      const res = await g.getPlainTextByPath('dbs/iam/__views__/view1.sql');

      expect(res).toBe('select 1;');
    });

    it('should throw when the path points to a directory', async () => {
      mockRequest.mockResolvedValueOnce({ data: [{ name: 'a.sql' }] });

      // See the note in getFileContentAndSha: the rule now lives in
      // getFileRawContent().
      await expect(g.getPlainTextByPath('dbs/iam/__views__')).rejects.toThrow(
        'getFileRawContent failed, path is a dir, not a file, path: dbs/iam/__views__.',
      );
    });

    it('should throw when the response carries no content', async () => {
      mockRequest.mockResolvedValueOnce({ data: { name: 'x', sha: 's1' } });

      await expect(
        g.getPlainTextByPath('dbs/iam/__views__/view1.sql'),
      ).rejects.toThrow(
        'getPlainTextByPath failed, res.content is not in res, check the path param.',
      );
    });
  });

  describe('getBlob', () => {
    it('should call the blob endpoint with owner, repo and sha', async () => {
      mockRequest.mockResolvedValueOnce({ data: { content: '', sha: 'b1' } });

      await g.getBlob('b1');

      expect(mockRequest).toHaveBeenCalledWith(BLOB_URL, {
        owner: 'db-man',
        repo: 'db',
        sha: 'b1',
        request: { signal: undefined },
      });
    });
  });

  describe('getBlobContentAndSha', () => {
    it('should decode the blob content and return it with the sha', async () => {
      const rows = [{ id: 7 }];
      mockRequest.mockResolvedValueOnce({
        data: { content: toBase64(JSON.stringify(rows)), sha: 'b2' },
      });

      const res = await g.getBlobContentAndSha('b2');

      expect(res.content).toEqual(rows);
      expect(res.sha).toBe('b2');
    });
  });

  describe('getDbsCfg', () => {
    it('should decode dbs.json, pass the sha through and ask for dbs.json', async () => {
      const cfg = { repoPath: 'dbs', dbModes: 'normal' };
      mockRequest.mockResolvedValueOnce({
        data: { content: toBase64(JSON.stringify(cfg)), sha: 'cfg-sha' },
      });

      const res = await g.getDbsCfg();

      expect(res.content).toEqual(cfg);
      expect(res.sha).toBe('cfg-sha');
      expect(mockRequest).toHaveBeenCalledWith(CONTENT_URL, {
        owner: 'db-man',
        repo: 'db',
        path: 'dbs.json',
        request: { signal: undefined },
      });
    });

    it('should throw when dbs.json resolves to a directory', async () => {
      mockRequest.mockResolvedValueOnce({ data: [{ name: 'dbs.json' }] });

      // See the note in getFileContentAndSha: the rule now lives in
      // getFileRawContent().
      await expect(g.getDbsCfg()).rejects.toThrow(
        'getFileRawContent failed, path is a dir, not a file, path: dbs.json.',
      );
    });

    it('should throw when the response carries no content', async () => {
      mockRequest.mockResolvedValueOnce({
        data: { name: 'dbs.json', sha: 's1' },
      });

      await expect(g.getDbsCfg()).rejects.toThrow(
        'getDbsCfg failed, res.content is not in res, check the path param.',
      );
    });
  });

  describe('createFile', () => {
    it('should send base64 content with the bot identity and return the response data', async () => {
      const data = { commit: { sha: 'c1' }, content: { sha: 'f1' } };
      mockCreateOrUpdateFileContents.mockResolvedValueOnce({ data });

      const res = await g.createFile({
        path: 'dbs/iam/users.data.json',
        content: '{"id":1}',
        message: '[db-man] Create table file (iam/users)',
      });

      expect(res).toBe(data);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner: 'db-man',
        repo: 'db',
        path: 'dbs/iam/users.data.json',
        // No sha is what makes this a create: the endpoint creates when the
        // field is absent. Pinned explicitly so a later edit that starts
        // forwarding a sha cannot slip through unnoticed.
        sha: undefined,
        message: '[db-man] Create table file (iam/users)',
        content: toBase64('{"id":1}'),
        committer: BOT,
        author: BOT,
      });
    });

    it("should default the commit message to 'Create file'", async () => {
      mockCreateOrUpdateFileContents.mockResolvedValueOnce({ data: {} });

      await g.createFile({
        path: 'dbs/iam/users.data.json',
        content: '[]',
      });

      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Create file' }),
      );
    });

    it('should reject a sha, because that is an overwrite and belongs to saveFile', async () => {
      // `sha` is typed as `never`, so only an untyped caller can get here.
      await expect(
        g.createFile({
          path: 'dbs/iam/users.data.json',
          content: '[]',
          sha: 'old-sha',
        } as any),
      ).rejects.toThrow(
        'createFile failed, sha must not be passed, use saveFile() to overwrite the existing file, path: dbs/iam/users.data.json.',
      );

      expect(mockCreateOrUpdateFileContents).not.toHaveBeenCalled();
    });

    it('should map a 409 conflict to the documented error message', async () => {
      // On a create, 409 is the concurrent-create case: two writers creating the
      // same path at the same time.
      mockCreateOrUpdateFileContents.mockRejectedValueOnce({
        response: { status: 409 },
      });

      const err = await g
        .createFile({ path: 'dbs/iam/users.data.json', content: '[]' })
        .catch((e) => e);

      expect(err).toBeInstanceOf(Error);
      // Literal on purpose. Asserting against the exported constant would also
      // pass after the constant's value is changed — verified by editing the
      // constant to a wrong string: this test is what turns red.
      expect(err.message).toBe('DBMERR_UPDATE_FILE_409_CONFLICT');
    });
  });

  describe('saveFile', () => {
    it('should send base64 content with the sha and the bot identity', async () => {
      const data = { commit: { sha: 'c1' }, content: { sha: 'f1' } };
      mockCreateOrUpdateFileContents.mockResolvedValueOnce({ data });

      const res = await g.saveFile({
        path: 'dbs/iam/users.data.json',
        content: '{"id":1}',
        sha: 'old-sha',
        message: '[db-man] Update table file (iam/users)',
      });

      expect(res).toBe(data);
      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith({
        owner: 'db-man',
        repo: 'db',
        path: 'dbs/iam/users.data.json',
        sha: 'old-sha',
        message: '[db-man] Update table file (iam/users)',
        content: toBase64('{"id":1}'),
        committer: BOT,
        author: BOT,
      });
    });

    it("should default the commit message to 'Update file'", async () => {
      mockCreateOrUpdateFileContents.mockResolvedValueOnce({ data: {} });

      await g.saveFile({
        path: 'dbs/iam/users.data.json',
        content: '[]',
        sha: 's',
      });

      expect(mockCreateOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Update file' }),
      );
    });

    it('should require a sha, because without it this is a create', async () => {
      await expect(
        g.saveFile({
          path: 'dbs/iam/users.data.json',
          content: '[]',
        } as any),
      ).rejects.toThrow(
        'saveFile failed, sha is required, use createFile() to create a new file, path: dbs/iam/users.data.json.',
      );

      expect(mockCreateOrUpdateFileContents).not.toHaveBeenCalled();
    });

    it('should map a 409 conflict to the documented error message', async () => {
      mockCreateOrUpdateFileContents.mockRejectedValueOnce({
        response: { status: 409 },
      });

      const err = await g
        .saveFile({
          path: 'dbs/iam/users.data.json',
          content: '[]',
          sha: 'stale-sha',
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(Error);
      // literal on purpose, see the createFile case above
      expect(err.message).toBe('DBMERR_UPDATE_FILE_409_CONFLICT');
    });

    it('should rethrow any other error untouched', async () => {
      const upstream = Object.assign(new Error('boom'), {
        response: { status: 500 },
      });
      mockCreateOrUpdateFileContents.mockRejectedValueOnce(upstream);

      await expect(
        g.saveFile({ path: 'p', content: '[]', sha: 's' }),
      ).rejects.toBe(upstream);
    });

    it('should rethrow a network error that has no response, not a TypeError', async () => {
      // A transport-level failure has no `response` at all. The error must come
      // through as itself — reading `.status` off nothing would replace it with
      // a TypeError and destroy the only clue about what went wrong.
      const upstream = new Error('socket hang up');
      mockCreateOrUpdateFileContents.mockRejectedValueOnce(upstream);

      await expect(
        g.saveFile({ path: 'p', content: '[]', sha: 's' }),
      ).rejects.toBe(upstream);
    });
  });

  describe('deleteFile', () => {
    it('should send the bot identity and return the response data', async () => {
      const data = { commit: { sha: 'c2' } };
      mockDeleteFile.mockResolvedValueOnce({ data });

      const res = await g.deleteFile({
        path: 'dbs/iam/users/1.json',
        sha: 'sha-1',
        message: '[db-man] Delete file (iam/users)',
      });

      expect(res).toBe(data);
      expect(mockDeleteFile).toHaveBeenCalledWith({
        owner: 'db-man',
        repo: 'db',
        path: 'dbs/iam/users/1.json',
        message: '[db-man] Delete file (iam/users)',
        sha: 'sha-1',
        committer: BOT,
        author: BOT,
      });
    });

    it("should default the commit message to 'Delete file'", async () => {
      mockDeleteFile.mockResolvedValueOnce({ data: {} });

      // Open question (registered in the plan, not fixed here): DeleteFileType
      // declares `message` as required while the write entries make it optional,
      // so this default is only reachable from untyped callers. The cast is what
      // it takes to exercise it.
      await g.deleteFile({ path: 'dbs/iam/users/1.json', sha: 's' } as any);

      expect(mockDeleteFile).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Delete file' }),
      );
    });

    it('should map a 409 conflict to the documented error message', async () => {
      mockDeleteFile.mockRejectedValueOnce({ response: { status: 409 } });

      const err = await g
        .deleteFile({
          path: 'dbs/iam/users/1.json',
          sha: 'stale-sha',
          message: '[db-man] Delete file (iam/users)',
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(Error);
      // literal on purpose, see the saveFile case above
      expect(err.message).toBe('DBMERR_DELETE_FILE_409_CONFLICT');
    });

    it('should rethrow any other error untouched', async () => {
      const upstream = Object.assign(new Error('boom'), {
        response: { status: 500 },
      });
      mockDeleteFile.mockRejectedValueOnce(upstream);

      await expect(
        g.deleteFile({ path: 'p', sha: 's', message: 'm' }),
      ).rejects.toBe(upstream);
    });

    it('should rethrow a network error that has no response, not a TypeError', async () => {
      // same hazard as the write path: no `response` on a transport failure
      const upstream = new Error('socket hang up');
      mockDeleteFile.mockRejectedValueOnce(upstream);

      await expect(
        g.deleteFile({ path: 'p', sha: 's', message: 'm' }),
      ).rejects.toBe(upstream);
    });
  });
});
