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
- Refactor: build the `GithubDb` instance **once, in the app layer**, and pass it down via
  `AppContext`. Three places construct their own today — `DbTablePage.tsx:26-38`,
  `CommonPageWrapper.tsx:24` (whose `:15` comment already admits the duplication), and the local
  helper in `src/components/PageHeaderContent.tsx:13-17` — and the third one *cannot* call the
  library at all: the header is a **sibling of `<Outlet>`** (`layout/PageLayout.tsx:22` vs `:49`),
  so instances created inside the routed pages are out of its reach. That file's `:12` TODO states
  the precondition ("first need to make sure GithubDb is initialized at the app level");
  `DbTablePage.tsx:63` carries the same note (`// TODO: move this to app context`).
  Do this **only if the instance moves too — never move the token check.**
  `CommonPageWrapper.tsx:19-22` returns `NotFound` when no token is stored, while `DbTablePage`
  builds one with an empty token; hoisting that check would turn the pages that legitimately need
  no token (Settings, Demos) into `NotFound`.
  Scope: ~5 source files plus the tests that hand-write `appCtx`. Wants a commit of its own — it is
  an architecture change, not a dedup.
- Related, already tracked in `docs/plans/2026-10-09-github-api-surface-gaps.md`: §3.2 (branch/ref
  support — `main` is hardcoded in `GithubDb.ts:120,124` and `GithubDbV2.ts:127-133`), and §5
  (delete the consumer-less `getContentByPathV2`, which is also the only caller of `getGitHubUrl` —
  the `/blob/`-less URL that 404s).
