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

export const getDataFileName = (tableName: string) => `${tableName}.data.json`;

export const getInsightsFileName = (tableName: string) =>
  `${tableName}.insights.gitlog`;

export const getRecordFileName = (primaryKeyVal: string | number) => {
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
