# TODO

- Feature: Show GitHub Actions pipeline status in the db-man page, so that we can know the latest status of the pipeline.
- Bug: When updating a record's primary key, a new record will be created, but the old record will be not changed.
- Why GitHub Action has `lerna` installed by default: https://github.com/db-man/db-man/pull/3
- After merge action, save git log to a file.
  - `git --no-pager log --follow --numstat --pretty="%H %ad" --date=short -- db_files_dir/iam/users.data.json`
- Move some parts of @db-man/cli to a new GitHub Action (like `actions/checkout`), because most of the scripts are only used in the CI.
- How to easy write table schema (maybe with a preview demo)
- Add `"ui:createUpdatePage:presets": ["spike", "cookie"]` to split-table-db.
- Can use antd Form to make the form more beautiful, for example the label and input in the same line.
