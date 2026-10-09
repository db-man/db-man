# AGENTS.md

Guidance for AI coding agents (and humans) in this repo. Deliberately short — a map, not a manual.

## What this is

db-man — **"Use GitHub as a database"**. Public repo (`db-man/db-man`). A React web portal manages
data that is stored as files inside a GitHub repo.

## Layout

Monorepo on npm workspaces (`packages/*`); lerna 8 and nx 20 are available for versioning/caching.

| Package | Role |
|---|---|
| `packages/github` | `@db-man/github` — wraps the GitHub API as a database. **A built artifact: other packages consume its output, not its source.** |
| `packages/components` | `@db-man/components` — the web portal (Create React App). |
| `packages/cli` | `@db-man/cli` — CLI. |
| `packages/google` | `@db-man/google` — Google integration. |
| `packages/slack` | `@db-man/slack` — Slack bot. |

Docs: `DEVELOP.md` (workflow), `DOC.md` (how to create a database), `TODO.md`, `CHANGELOG.md`,
`docs/plans/` (plans — see Boundaries).

## Commands

Setup — order matters, `@db-man/components` depends on the built `@db-man/github`:

```sh
npm i
npm run build -w packages/github
npm start                        # dev server (== npm start -w packages/components)
```

After editing `packages/github` source, rebuild before the dev server can see it:

```sh
./rebuild_github.sh && npm start
```

| Task | Command |
|---|---|
| Test everything | `npm test` (== `npm run test --workspaces`) |
| Test one package | `npm run test -w packages/<pkg>` |
| Coverage (components; enforces `coverageThreshold`) | `npm run test:coverage -w packages/components` |
| Network test (github only) | `DBM_GH_TOKEN=... npm run tt -w packages/github` |
| Build everything / one package | `npm run build` / `npm run build -w packages/<pkg>` |
| Release | `npm run release` (test → build → `lerna publish`) |

Runners differ by package: `cli` / `github` / `google` / `slack` use `jest --detectOpenHandles`;
`components` uses `CI=true react-scripts test`, which does **not** collect coverage.

## CI

`.github/workflows/test.yml` — on push to `main` and on every PR. Node 24, `npm ci`, builds
`packages/github`, runs `npm test`, then `npm run test:coverage -w packages/components`.
Env: `TZ=Asia/Shanghai`, secret `DBM_GH_TOKEN`. Coverage is only enforced in that last step.

`.github/workflows/cypress.yml` — on every push, runs `cypress-io/github-action` against
`packages/components` **without** `component: true`, so only `cypress/e2e/**` executes; component
specs (`src/**/*.cy.tsx`) never run on CI.

The other four workflows (`merge` / `split` / `validate` / `insights`) are `workflow_call` only.

## Gotchas

- **Test files are type-checked and compiled.** `packages/github/tsconfig.json` `include` is
  `./src/**/*.ts`, so `*.test.ts` lands in `dist/` and `es6/`. A type error in a test fails
  `npm run build`, and CI builds that package before testing it.
- **`@db-man/github` tests must mock two channels.** Mocking `./octokit` as `{ request }` alone is
  not enough — write paths go through `octokit(...).rest.repos.*` and throw `TypeError`. Supply
  `request` **and** `rest.repos.*`.
- **`*.tt.ts` is not part of `npm test`.** Jest's default `testRegex` does not match it; it runs via
  `npm run tt`, needs a real `DBM_GH_TOKEN`, and hits the network — so it never runs on CI.
- **CRA sets `resetMocks: true`** (`packages/components`). Module-scope
  `jest.fn().mockImplementation(...)` is wiped before every test — put implementations inside
  `it()` / `beforeEach()`. For the same reason the jsdom shims in `src/setupTests.ts` are plain
  functions, not `jest.fn()`.
- **Jest 27 does not support the package `exports` field.** Subpaths declared only in `exports`
  (e.g. `@uiw/react-json-view/light`) fail to resolve; `packages/components/package.json`
  `jest.moduleNameMapper` works around it. CRA merges object-form config, so defaults survive.
- **This repo is public.** Everything committed — docs and notes included — is world-readable and
  permanent. No tokens, no personal filesystem paths, no third-party internal information.
- **A module-level `debounce` is painful to test — shorten it, don't fake time it.** `ListPage`
  builds `debounce(updateUrl, 500)` at module scope. Rather than mixing `jest.useFakeTimers()` with
  RTL's `waitFor`, mock the delay: `jest.mock('lodash.debounce', () => (fn) => jest.requireActual('lodash.debounce')(fn, 20))`.
  The real `updateUrl` and the real `window.location` stay in play, so tests can assert on the URL.
- **Scope `getByText` to the element when a label is repeated.** On `ListPage` the text `Name` is both
  a column header and a filter label, so `getByText('Name')` throws "found multiple elements". Pick
  column headers out of `.ant-table-thead th` by element instead.
- **`ListPage` fetches twice on mount.** Both `useEffect` blocks in it (`deps: []` and
  `deps: [props.tableName]`) call `getData`, so every mount issues the same request twice. Not a
  correctness bug, but it doubles the request count. `docs/plans/2026-10-07-components-ut-coverage.md`
  §3.9.8 has the fix; a test named `fetches the rows twice on mount` pins the current behaviour.
- **`coverage/coverage-summary.json` goes stale — read the stdout table instead.** CRA writes
  `coverage-final.json` + lcov + text + clover by default, not a *summary*. The summary file only
  appears when you ask for it (`--coverageReporters=json-summary`), so an old copy can sit in
  `coverage/` and answer with the numbers of a run from days ago. Either read the text table jest
  prints, or write to a scratch dir: `--coverageReporters=json-summary --coverageDirectory=/tmp/cov`.
  To measure a few files without paying for the full ~5 minute run, add `--testPathPattern`.
- **antd `Table` inserts a hidden measure row.** The first `tbody tr` is
  `.ant-table-measure-row` (`aria-hidden`, zero height), so indexing `tbody tr` is off by one and
  "expect N rows" fails at N+1. Query `tr.ant-table-row` instead. Related: `react-simple-code-editor`
  renders a contenteditable `div.npm__react-simple-code-editor__textarea`, not a `textarea`.
- `formatDate` depends on `TZ=Asia/Shanghai`; CI supplies it through `env`, not the test script.
- Doc drift: root `DEVELOP.md` quotes `"test": "TZ=Asia/Shanghai lerna run test"`, but the real root
  script is `npm run test --workspaces`. `README.md` links `packages/insights`, which does not exist.

## Boundaries

- Plans live in `docs/plans/YYYY-MM-DD-<topic>.md`. **Each plan belongs to its task: read others
  freely, but do not edit or merge someone else's** — add your own file instead.
- Plans are written for a downstream executor and must be self-contained: exact commands, paths,
  mock shapes, and acceptance criteria.
- Multiple agents may work in this tree at the same time. Stage and commit only the files you
  changed — do not sweep someone else's in-flight edits into your commit. If files you did not
  touch show up as modified, leave them alone and say so.
