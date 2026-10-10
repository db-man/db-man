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
- Bug: editing a record rewrites its primary key as a string. `getNewRows` merges the form values
  over the row (`{...row, ...formValues}`) and a form field always yields a string, so a `NUMBER`
  primary key turns from `1` into `'1'` in the data file on the first edit. Record lookup no
  longer cares (it compares string forms since PR #1), but the file stops matching the column
  type declared in `dbcfg.json`. Found while fixing the `===` lookup bug; deliberately not
  changed there.
