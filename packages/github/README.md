# github

## V2

Two new classes, `GithubV2` and `GithubDbV2`, rework the V1 API surface
(`Github` / `GithubDb`): row-level operations (`getRow` / `insertRow` /
`updateRow` / `deleteRow`) that dispatch on a required constructor argument
`dbModes`, typed errors (`GithubError`), and opaque row revisions (`rev`).
The name-by-name V1 → V2 mapping is in [DOC.md](./DOC.md#v1--v2-mapping);
the design rationale is in the repo's
`docs/plans/2026-10-09-github-api-surface-gaps.md`.

```js
import { GithubDbV2 } from '@db-man/github';

const githubDb = new GithubDbV2({
  personalAccessToken: 'your personal access token',
  repoPath: 'db_files_dir',
  dbsSchema, // same shape as for GithubDb
  dbModes: 'normal', // or 'split-table' — from dbs.json; required, no default
  owner: 'your github username',
  repoName: 'your repo name',
});

githubDb.getTableRows('iam', 'users').then(({ content, sha }) => {
  console.log(content, sha);
});
```

## V1

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
