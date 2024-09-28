## Debug

```
node bin/cli.mjs __test_dbs_dir__ split
node bin/cli.mjs __test_dbs_dir__ split iam/users
node bin/cli.mjs __test_dbs_dir__ split iam/roles
node bin/cli.mjs __test_dbs_dir__ merge
node bin/cli.mjs __test_dbs_dir__ merge iam/users
node bin/cli.mjs __test_dbs_dir__ merge iam/roles
```

## Publish npm

```
npm version patch
git push && git push origin v0.1.2
npm publish --access=public
```
