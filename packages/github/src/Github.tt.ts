import Github, { DBMERR_UPDATE_FILE_409_CONFLICT } from './Github';
import { formatDate } from './utils';

/**
 * Use Jest to test only this file with realworld token
 * Usage: GH_TOKEN=123 npm run tt
 */

describe('Github in real world', () => {
  it('should throw an error when updating 2 files at the same time', async () => {
    const github = new Github({
      personalAccessToken: process.env.GH_TOKEN ?? '',
      owner: 'db-man',
      repoName: 'split-table-db',
    });

    const date = new Date();
    const user1Record = {
      userId: date.valueOf(),
      name: 'Test user 1',
      createdAt: formatDate(date),
      updatedAt: formatDate(date),
    };
    const user2Record = {
      userId: date.valueOf(),
      name: 'Test user 2',
      createdAt: formatDate(date),
      updatedAt: formatDate(date),
    };

    await Promise.all([
      github
        .updateFile({
          path: `db_files_dir/iam/users/${user1Record.userId}.json`,
          content: JSON.stringify(user1Record, null, 2),
          sha: undefined,
          message: 'Create user 1 from test',
        })
        .catch((error) => {
          console.log('error:', error);
          // assert the error is a 409 error
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe(DBMERR_UPDATE_FILE_409_CONFLICT);
        }),
      github
        .updateFile({
          path: `db_files_dir/iam/users/${user2Record.userId}.json`,
          content: JSON.stringify(user2Record, null, 2),
          sha: undefined,
          message: 'Create user 2 from test',
        })
        .catch((error) => {
          // assert the error is a 409 error
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe(DBMERR_UPDATE_FILE_409_CONFLICT);
        }),
    ]);
  });
});
