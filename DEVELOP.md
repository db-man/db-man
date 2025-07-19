# Develop

## Development Workflow

1. Coding
2. Run `npm run release`

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

Reminder for testing on CI: To make sure the test case for `formatDate` in `@db-man/github` always use local time, we set the `TZ` environment variable to `Asia/Shanghai` in the CI.

```json
"test": "TZ=Asia/Shanghai lerna run test"
```

## Build

```sh
npm run build # build all packages
npm run build -w packages/components # build only single package
```

## Publish

Publish all packages.

```sh
npm run publish
```

Only publish one package.

```sh
cd packages/github
GH_TOKEN=ghp_123 npm run release
```

## Release all packages

To release packages, will run UT first, then build the package, at last pulish to npmjs.

```sh
npm run release
```

## Check outdated

```sh
npm outdated
```

## How to debug @db-man/github in @db-man/components

After @db-man/github changed source code, call script to rebuild `@db-man/github` source code, then restart dev server to make sure `@db-man/components` to load the new code.

```sh
./rebuild_github.sh
npm run dev
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

## References

- https://github.com/airbnb/visx/blob/master/packages/visx-axis/package.json
- Other repo/product which use GitHub as a database:
  - https://github.com/issue-db/issue-db
  - https://github.com/DavidBruant/github-as-a-database
  - https://gitrows.com/
  - https://github.com/usmakestwo/githubDB
