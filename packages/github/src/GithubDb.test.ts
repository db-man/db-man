import GithubDb from './GithubDb';
import Github from './Github';

jest.mock('./Github', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getFileContentAndSha: jest.fn(),
    getContentByPath: jest.fn(),
    getBlobContentAndSha: jest.fn(),
  })),
}));

// no print console.debug
jest.spyOn(console, 'debug').mockImplementation(() => undefined);

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

describe('GithubDb', () => {
  it('should return proper value', async () => {
    const mockGithub = {
      getFileContentAndSha: jest.fn(),
      getContentByPath: jest
        .fn()
        .mockResolvedValue([{ name: 'users.data.json', sha: 'abc123' }]),
      getBlobContentAndSha: jest
        .fn()
        .mockResolvedValue({ content: [{ id: 1 }], sha: 'abc123' }),
      getPlainTextByPath: jest
        .fn()
        .mockResolvedValue('console.log("Hello World");'),
    };

    (Github as unknown as jest.Mock).mockImplementation(() => mockGithub);

    const gd = new GithubDb({
      personalAccessToken: 'test-token',
      repoPath: 'dbs',
      owner: 'db-man',
      repoName: 'db',
      dbsSchema: mockDbsSchema,
    });
    const data = await gd.getTableRows('iam', 'users');

    // test getDbViewScriptFileContentAndSha
    const result = await gd.getDbViewScriptFileContentAndSha(
      'iam',
      'view1.sql',
    );

    expect(mockGithub.getContentByPath).toHaveBeenCalledWith(
      'dbs/iam',
      undefined,
    );
    expect(mockGithub.getBlobContentAndSha).toHaveBeenCalledWith(
      'abc123',
      undefined,
    );
    expect(data.sha).toBe('abc123');
    expect(result).toEqual('console.log("Hello World");');
  });
});
