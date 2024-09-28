## Debug

```
node bin/cli.mjs split
node bin/cli.mjs split iam/users
node bin/cli.mjs split iam/roles
node bin/cli.mjs merge
node bin/cli.mjs merge iam/users
node bin/cli.mjs merge iam/roles
```

## Publish npm

```
npm version patch
git push && git push origin v0.1.2
npm publish --access=public
```
