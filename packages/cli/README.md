# cli

## Summary

1. Split one big table file to multiple table record files.
2. Merge multiple table record files to one big table file.
3. Convert git log commit data to csv format which shows the total number of lines in a file on each date

## How to use

Create a `dbs.json` file with content:

```json
{
  "repoPath": "dbs"
}
```

### Split

Run the following commands:

```sh
npx @db-man/cli split
npx @db-man/cli split iam/users # If only process one table file at a time.
```

### Merge

Run the following commands:

```sh
npx @db-man/cli merge
npx @db-man/cli merge iam/users # If only process one table file at a time.
```

### mergeUpdatedTables

Run the following commands:

```sh
node bin/cli.mjs mergeUpdatedTables 787fc97a43ff53b42288527b28fdb810a519c524
```

The sha is from GitHub Actions pipeline env var `GITHUB_SHA`.

### splitUpdatedTables

Run the following commands:

```sh
node bin/cli.mjs splitUpdatedTables 787fc97a43ff53b42288527b28fdb810a519c524
```

The sha is from GitHub Actions pipeline env var `GITHUB_SHA`.

### Insights

Run the following commands:

```sh
npx @db-man/cli printInsights iam/users
```

Copy the output to a file `lines.csv`, then use https://csvplot.com/ to plot the chart.
