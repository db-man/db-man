import type { PrimaryKeyVal } from './types';

// // Check something like: "Failed to load resource: the server responded with a status of 409 ()"
// const _checkError = (response) => {
//   if (!response.ok) {
//     console.log("failed response:", response);

//     // http status code is 409
//     // response json = {
//     //   documentation_url: "https://docs.github.com/rest/reference/repos#create-or-update-file-contents"
//     //   message: "{dbs_dir}/{db_name}/{table_name}.json does not match 61c...7ca"
//     // }
//     // response.ok: false
//     // response.status: 409
//     // response.statusText: ""
//     // ? error "Failed to load resource: the server responded with a status of 409 ()"

//     // make the promise be rejected if we didn't get a 2xx response
//     throw new Error("Not 2xx response");
//   }
//   return response;
// };

/**
 * Get valid file name
 * See: https://stackoverflow.com/a/4814088
 * @param oldStr
 * @returns POSIX "Fully portable filenames"
 */
export function validFilename(oldStr: string) {
  return oldStr.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Whether two primary key values mean the same record.
 *
 * The primary key of a row read out of a data file is whatever JSON type the
 * file holds, so a `NUMBER` primary column gives the number `1`. The same key
 * coming from a URL query (`?userId=1`) or a form field is always the string
 * `'1'`, so `===` never matches the two and the row is silently not found.
 * Compare the string forms instead.
 *
 * `null` / `undefined` mean "no value" and match nothing, not even each other:
 * a row that has no primary key must not be picked as the row of a missing
 * query parameter.
 *
 * `packages/components/src/utils.ts` has a function with this name and these
 * semantics — it predates this one, from the fix recorded in
 * `docs/plans/2026-10-09-github-api-surface-gaps.md` §3.1.1. The two are kept
 * in step by hand until components can import this one instead.
 */
export const isSamePrimaryKey = (
  a: PrimaryKeyVal | null | undefined,
  b: PrimaryKeyVal | null | undefined,
) => {
  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }
  return String(a) === String(b);
};

export const getDataFileName = (tableName: string) => `${tableName}.data.json`;

export const getInsightsFileName = (tableName: string) =>
  `${tableName}.insights.gitlog`;

export const getRecordFileName = (primaryKeyVal: PrimaryKeyVal) => {
  if (typeof primaryKeyVal === 'number') {
    return `${validFilename(String(primaryKeyVal))}.json`;
  }
  return `${validFilename(primaryKeyVal)}.json`;
};

/**
 * @param {Date} d
 * @returns {string} "2021-07-04 01:16:01"
 */
export const formatDate = (d: Date) => {
  const pad = (num) => num.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours() // eslint-disable-line @typescript-eslint/comma-dangle
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
