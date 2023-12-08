import GithubDb from './GithubDb';

describe('GithubDb', () => {
  it('should return proper value', async () => {
    const gd = new GithubDb({
      personalAccessToken: process.env.TOKEN ?? '',
      repoPath: 'dbs',
      owner: 'db-man',
      repoName: 'db',
      dbsSchema: '{"iam":[{"name":"users","large":true},{"name":"roles"}]}',
    });
    const data = await gd.getTableRows('iam', 'users');
    // console.log('GithubDb getTableRows data:', data);
    expect((data.sha)).not.toBe('');
  });
});
