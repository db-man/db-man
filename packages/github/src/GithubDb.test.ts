import GithubDb from './GithubDb';

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
    const gd = new GithubDb({
      personalAccessToken: process.env.GH_TOKEN ?? '',
      repoPath: 'dbs',
      owner: 'db-man',
      repoName: 'db',
      dbsSchema: mockDbsSchema,
    });
    const data = await gd.getTableRows('iam', 'users');
    // console.log('GithubDb getTableRows data:', data);
    expect(data.sha).not.toBe('');
  });
});
