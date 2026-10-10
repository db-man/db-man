import * as dbManGithub from './index';

/**
 * `src/index.ts` is the only door consumers come in through: `package.json`
 * `main` is `dist/index.js`, which is built from this file. A class that is
 * not listed here is unreachable from `@db-man/github` no matter how complete
 * it is, so the door itself is worth pinning — `GithubV2` / `GithubDbV2` sat
 * behind a closed door for a while precisely because of a missing line here.
 */
describe('public entry', () => {
  it('exports every door in one place', () => {
    expect(Object.keys(dbManGithub)).toEqual(
      expect.arrayContaining([
        'types',
        'contants',
        'Github',
        'GithubDb',
        'GithubV2',
        'GithubDbV2',
        'utils',
        'insightsUtils',
      ]),
    );
  });

  it('exports GithubV2 and GithubDbV2 as constructors', () => {
    expect(typeof dbManGithub.GithubV2).toBe('function');
    expect(typeof dbManGithub.GithubDbV2).toBe('function');
  });

  it('exports the real classes, not empty stand-ins', () => {
    const githubV2 = new dbManGithub.GithubV2({
      personalAccessToken: 'token',
      owner: 'owner',
      repoName: 'repo',
    });
    expect(githubV2.getGitHubUrl('dbs/iam')).toBe(
      'https://github.com/owner/repo/dbs/iam',
    );

    const githubDbV2 = new dbManGithub.GithubDbV2({
      personalAccessToken: 'token',
      repoPath: 'dbs',
      dbsSchema: {},
      owner: 'owner',
      repoName: 'repo',
    });
    expect(githubDbV2.getRowPath('iam', 'users', 1)).toBe(
      'dbs/iam/users/1.json',
    );
  });
});
