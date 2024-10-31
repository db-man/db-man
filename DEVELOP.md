# Develop

## Develop

```sh
npm i # install dependencies for all packages
npm run build -w packages/github # Build this package first, because it's a dependency of @db-man/components
npm run dev # start dev env
```

## Testing

```sh
npm run test --workspaces # test all packages
npm run test -w packages/components # test only single package
```

### CI

To make sure the test case for `formatDate` in `@db-man/github` always use local time, we set the `TZ` environment variable to `Asia/Shanghai` in the CI.

```json
"test": "TZ=Asia/Shanghai lerna run test"
```

## Build

```sh
npm run build # build all packages
npm run build -w packages/components # build only single package
```

## Publish

```sh
npm run publish
```

### Only publish one package

```sh
cd packages/github
GH_TOKEN=ghp_123 npm run release
```

## Check outdated

```sh
npm outdated
```

### How to debug @db-man/github in @db-man/components

After @db-man/github changed source code, will need this affects @db-man/components.

```sh
npx lerna run build --scope @db-man/github # build ts to js (in dist dir)
npm i # install the changed @db-man/github dependency
rm -rf packages/components/node_modules/.cache # remove create-react-app cache
```

## Issue 1

```
$ npx lerna bootstrap
$ npx lerna run start --scope=db-man.github.io
```

```
Compiled with problems:

ERROR in ./src/App/styles.css (./node_modules/css-loader/dist/cjs.js??ruleSet[1].rules[1].oneOf[5].use[1]!./node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[1].oneOf[5].use[2]!./node_modules/source-map-loader/dist/cjs.js!./src/App/styles.css) 4:0-251

Module not found: Error: You attempted to import ../../../components/lib/layout/App.css which falls outside of the project src/ directory. Relative imports outside of src/ are not supported.
You can either move it inside src/, or add a symlink to it from project's node_modules/.
```

```
$ ls -l node_modules/@db-man
total 0
lrwxr-xr-x  1 chenyang  staff    19B Aug 10 23:30 components -> ../../../components
```

Root cause: https://stackoverflow.com/questions/44114436/the-create-react-app-imports-restriction-outside-of-src-directory

## TODO

- Feature: Show GitHub Actions pipeline status in the db-man page, so that we can know the latest status of the pipeline.
- Bug: When updating a record's primary key, a new record will be created, but the old record will be not changed.
- Why GitHub Action has `lerna` installed by default: https://github.com/db-man/db-man/pull/3
- After merge action, save git log to a file.
  - `git --no-pager log --follow --numstat --pretty="%H %ad" --date=short -- db_files_dir/iam/users.data.json`
- Move some parts of @db-man/cli to a new GitHub Action (like `actions/checkout`), because most of the scripts are only used in the CI.

## References

- https://github.com/airbnb/visx/blob/master/packages/visx-axis/package.json
- Other repo/product which use GitHub as a database:
  - https://github.com/issue-db/issue-db
  - https://github.com/DavidBruant/github-as-a-database
  - https://gitrows.com/
  - https://github.com/usmakestwo/githubDB
