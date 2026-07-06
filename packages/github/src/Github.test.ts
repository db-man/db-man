import Github from './Github';
import octokit from './octokit';

jest.mock('./octokit');

const mockedOctokitFactory = octokit as jest.MockedFunction<typeof octokit>;
const mockRequest = jest.fn();

describe('Github', () => {
  const g = new Github({
    personalAccessToken: 'test-token',
    owner: 'db-man',
    repoName: 'db',
  });

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest.mockReset();
    mockedOctokitFactory.mockReturnValue({ request: mockRequest } as any);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('getContentByPath', () => {
    it('should return an array with the expected length when calling getContentByPath with a directory path', async () => {
      mockRequest.mockResolvedValueOnce({
        data: [{ name: 'a.json' }, { name: 'b.json' }],
      });

      const data = await g.getContentByPath('dbs/iam');

      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });

    it('should return the correct file object when calling getContentByPath with a file path', async () => {
      mockRequest.mockResolvedValueOnce({
        data: { name: 'dbcfg.json', content: 'eyJ0ZXN0Ijp0cnVlfQ==' },
      });

      const data = await g.getContentByPath('dbs/iam/dbcfg.json');

      if ('content' in data) {
        expect(data.name).toBe('dbcfg.json');
        return;
      }

      expect(true).toBe(false);
    });

    it('should throw an error when calling getContentByPath with a non-existent path', async () => {
      mockRequest.mockRejectedValueOnce({ status: 404 });

      await expect(g.getContentByPath('non-existent-path')).rejects.toThrow(
        'path not found',
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
  });
});
