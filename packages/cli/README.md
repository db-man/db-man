# cli

## Summary

1. Split one big table file to multiple table record files.
2. Merge multiple table record files to one big table file.

## How to use

1. Create a `dbs.json` file with content:

```json
{
  "repoPath": "dbs"
}
```

2. Run the following commands:

```
npx @db-man/cli split
npx @db-man/cli merge
```

3. If only process one table file at a time.

```
npx @db-man/cli split iam/users
```
