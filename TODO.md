# TODO

- Feature: Show GitHub Actions pipeline status in the db-man page, so that we can know the latest status of the pipeline.
- Bug: When updating a record's primary key, a new record will be created, but the old record will be not changed.
- Move some parts of @db-man/cli to a new GitHub Action (like `actions/checkout`), because most of the scripts are only used in the CI.
- How to easy write table schema (maybe with a preview demo)
- Add `"ui:createUpdatePage:presets": ["spike", "cookie"]` to split-table-db.
- Can use antd Form to make the form more beautiful, for example the label and input in the same line.
- Bug: `DeleteFileType.message` is required while `UpdateFileType.message` is optional, so the
  `message = 'Delete file'` default in `Github.deleteFile` is unreachable for any type-checked
  caller — no caller is allowed to omit it. The unit test only reaches that branch through an
  explicit cast (`as unknown as DeleteFileType`). Decide which side is the truth: make
  `DeleteFileType.message` optional in `types.ts`, or make `UpdateFileType.message` required so
  the two write APIs agree.
- Bug: record lookup in the portal compares a row value against a URL query string with `===`, so
  it never matches when the primary column is `NUMBER` (`1 === '1'` is false). Affected:
  `components/.../GetPageBody/index.tsx` and `components/.../DbTablePage/UpdatePage/index.tsx`.
  Only reachable in normal (non `split-table`) mode, where the record is found by scanning the
  table rows instead of by building the record file path. This is not hypothetical:
  `packages/cli/__test_dbs_dir__/iam/dbcfg.json` ships `userId` as `NUMBER` + `primary: true`, and
  `Github.tt.ts` uses `date.valueOf()` as a primary key.
- Bug: the two codebases turn a numeric primary key into a file name differently.
  `packages/cli/bin/processTables.mjs` uses `row[primaryKey] + ''` for `NUMBER` columns (no
  sanitising), while `@db-man/github` always uses `validFilename(String(x))`. Identical for
  ordinary magnitudes; they diverge only when the number string contains a character
  `validFilename` rewrites, e.g. `1e21` becomes `1e+21` vs `1e_21`. Pick one rule and share it.
