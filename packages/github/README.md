# github

How to use `Github` class:

```js
import { Github } from '@db-man/github';

const github = new Github({
  personalAccessToken: 'your personal access token',
  owner: 'your github username',
  repoName: 'your repo name',
});

github.getFileContentAndSha('/path/to/file').then(({ content, sha }) => {
  console.log(content, sha);
});
```

How to use `GithubDb` class:

```js
import { GithubDb } from '@db-man/github';

const dbsSchema = {
  iam: {
    name: 'iam',
    description: 'iam db',
    tables: [
      {
        name: 'users',
        large: false,
      },
    ],
  },
};

const githubDb = new GithubDb({
  personalAccessToken: 'your personal access token',
  repoPath: 'db_files_dir',
  dbsSchema,
  owner: 'your github username',
  repoName: 'your repo name',
});

githubDb.getTableRows('iam', 'users').then(({ content, sha }) => {
  console.log(content, sha);
});
```
