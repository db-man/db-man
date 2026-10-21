# DOC

## V1 → V2 mapping

V2 (`GithubV2` / `GithubDbV2`) reworks the API surface of V1 (`Github` / `GithubDb`).
This is the name-by-name lookup for consumers migrating over. Design rationale
(why `dbModes` is a required constructor arg, why `rev` is opaque, why the record
primitives went private) lives in `docs/plans/2026-10-09-github-api-surface-gaps.md`
— frozen, do not extend it.

### `Github` → `GithubV2`

| V1 | V2 | Difference |
| --- | --- | --- |
| `getContentByPath` | `getRawContentByPath` | Same return shape (dir → array, file → object; `content` is base64). Errors change from plain `Error` to `GithubError` carrying a `type` (`UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` / `UNKNOWN`) plus `status` and `cause`. Message strings are kept byte-for-byte (including the `unknow` typo) — consumers match on them. |
| `getContentByPathV2` | `getContentByPathV2` | Carried over unchanged (`[err, data]` tuple, never throws). No production caller in either version — prefer `getRawContentByPath`. |
| `getFileContentAndSha` | same name | Unchanged: returns `{ content, sha }` with content decoded. |
| `getPlainTextByPath` | same name | Unchanged. |
| `getBlobContentAndSha` | same name | Unchanged. |
| `getDbsCfg` | same name | Unchanged behavior (empty `dbs.json` throws in both); internal call switched to `getFileRawContent`. |
| `updateFile` | split into `createFile` + `saveFile` | `createFile` must not take a sha (GitHub 422 → `ALREADY_EXISTS`); `saveFile` requires the sha you read (409 → `CONFLICT`, constant `DBMERR_UPDATE_FILE_409_CONFLICT`). Both require `message`. |
| `deleteFile` | same name | `message` is now required (V1 defaulted it to `'Delete file'`); 409 → `CONFLICT` (`DBMERR_DELETE_FILE_409_CONFLICT`). |

### `GithubDb` → `GithubDbV2`

Constructor: V2 additionally requires `dbModes: 'normal' | 'split-table'` — where the
rows of a database live; the caller reads it from the repo's `dbs.json` and passes it
in. Illegal values throw at construction. It decides which file the row-level API
touches, and validates every `rev` against it.

Path helpers — same signatures, renamed for symmetry (a record file is called a row
in V2):

| V1 | V2 |
| --- | --- |
| `getRecordPath` | `getRowPath` |
| `getDataPath` | `getTableDataPath` |
| `getDataUrl` | `getTableDataUrl` |
| `getInsightsPath` | same name |
| `getDbViewScriptPath` | same name |
| `getDbConfigPath` | same name |
| `getGitHubRepoPath` / `getGitHubFullPath` / `getGitHubHistoryPath` | same name |

Data access:

| V1 | V2 | Difference |
| --- | --- | --- |
| `getTableRows` | same name | Unchanged. |
| `getTableInsights` | same name | Unchanged. |
| `getDbTablesSchemaAsync` | `getDbTablesSchema` | `Async` suffix dropped. |
| `getDbTablesSchemaV2Async` | `getDbTablesSchemaV2` | `Async` suffix dropped. (The thrown message still says `getDbTablesSchemaV2Async` — kept because a test pins it.) |
| `getDbViewScriptFileContentAndSha` | same name | Unchanged. |
| `getTableSchema` / `isLargeTable` | same name | Unchanged. |
| `createDatabaseSchema` / `updateDatabaseSchema` / `createTableSchema` | same names | Unchanged. |
| `updateTableFile` | same name | Unchanged signature; internally `createFile` when no sha is passed, `saveFile` when one is. |
| `getRecordFileContentAndSha` | `getRow` | Returns `{ row, rev } \| null` instead of `{ content, sha }`. A missing row (404 only) is `null`, not an error. Reads the record file **or** the table file depending on `dbModes` — the caller no longer picks. The `sha` is wrapped in an opaque `rev` that only `getRow` can produce, and `updateRow` / `deleteRow` refuse a `rev` read in another mode. |
| `updateRecordFile` | `updateRow` | Takes the whole row plus a `rev` from `getRow`; refuses primary-key changes. The raw file primitive is now private (`saveRecordFile`). |
| `deleteRecordFile` | `deleteRow` | Takes a `rev` from `getRow`; works in normal mode too (rewrites the table file). The raw primitive is now private (`deleteRecordFile`). |
| — (nothing in V1) | `insertRow` | New. Creates a record file in split-table mode, appends to the table file in normal mode. Duplicate keys throw: `DUPLICATE_KEY` (normal) / `ALREADY_EXISTS` (split). Row-level writes return `{ ...response, mode, action }` so the actual write path is visible. |

## Dirs

- `src` - source code
- `dist` - commonjs code
- `es6` - ES6 code

## Build to commonjs

```json
{
  "scripts": {
    "build": "rm -rf dist && babel src --out-dir dist --extensions '.ts,.js' --copy-files --source-maps && tsc"
  }
}
```

1. We use babel to build the typescript code to commonjs code.
2. We use tsc to generate the declaration file (`*.d.ts`)

## Build to ES6

```json
{
  "scripts": {
    "build:es6": "rm -rf es6 && tsc --declaration false --emitDeclarationOnly false --target es6 --module es6 --outDir es6"
  }
}
```

This build the original typescript code to ES6 code.

From

```typescript
export const formatDate = (d: Date) => {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
```

To

```js
export function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
```

Why not use `tsconfig.json`, but put in command line options?
Because the `tsconfig.json` already used to generate the declaration file (`*.d.ts`)

## References

- https://www.typescriptlang.org/docs/handbook/compiler-options.html
