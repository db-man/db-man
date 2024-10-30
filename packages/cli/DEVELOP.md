# DEVELOP

## How to develop from local machine

```sh
node bin/cli.mjs split
node bin/cli.mjs split iam/users
node bin/cli.mjs split iam/roles
node bin/cli.mjs merge
node bin/cli.mjs merge iam/users
node bin/cli.mjs merge iam/roles
```

### mergeV2

Single table records change

```sh
$ git diff-tree --no-commit-id --name-only -r 787fc97a43ff53b42288527b28fdb810a519c524
packages/cli/__test_dbs_dir__/iam/users/1.json
$ node bin/cli.mjs mergeV2 787fc97a43ff53b42288527b28fdb810a519c524
```

Multiple tables records change

```sh
$ git diff-tree --no-commit-id --name-only -r 8a44b1f55509cd033fd9ac000c218c623f21f6d4
packages/cli/__test_dbs_dir__/iam/roles/developer.json
packages/cli/__test_dbs_dir__/iam/users/2.json
$ node bin/cli.mjs mergeV2 8a44b1f55509cd033fd9ac000c218c623f21f6d4
```
