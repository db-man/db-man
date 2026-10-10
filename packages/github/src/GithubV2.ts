// @ts-ignore TODO Cannot find module 'js-base64' or its corresponding type declarations.ts(2307)
import { Base64 } from 'js-base64';

import octokit from './octokit';
import {
  DbsCfgContentAndShaType,
  DeleteFileType,
  FileContentAndSha,
  FileOrDir,
  RawFileContentAndSha,
} from './types';
import { DBS_CFG_FILENAME } from './constants';

type GithubContext = {
  personalAccessToken: string;
  owner: string;
  repoName: string;
};

/**
 * What the two write entries have in common. `PUT .../contents/{path}` creates
 * the file when it is sent no sha and overwrites it when it is sent one, so the
 * presence of a sha is the only thing that decides which of the two happened.
 * `createFile` and `saveFile` are narrow views of this one shape.
 */
type WriteFileParams = {
  path: string;
  content: any;
  sha?: string;
  message: string;
};

type CreateFileParams = {
  path: string;
  content: any;
  message?: string;
  /**
   * Must not be passed — overwriting a known version is what `saveFile()` is
   * for. Declared as `never` so TypeScript rejects it at the call site instead
   * of silently turning a create into an overwrite.
   */
  sha?: never;
};

type SaveFileParams = {
  path: string;
  content: any;
  /**
   * Required. The version you read with `getFileContentAndSha()` — GitHub
   * refuses the write if the file has changed since that read.
   */
  sha: string;
  message?: string;
};

const botName = 'db-man-bot';
const committer = {
  name: botName,
  email: 'db-man-bot-email',
};
const author = {
  name: botName,
  email: 'db-man-bot-email',
};

export const DBMERR_UPDATE_FILE_409_CONFLICT =
  'DBMERR_UPDATE_FILE_409_CONFLICT';
export const DBMERR_DELETE_FILE_409_CONFLICT =
  'DBMERR_DELETE_FILE_409_CONFLICT';

/**
 * Usage:
 * ```js
 * const github = new Github({
 *   personalAccessToken: 'your-personal-access-token',
 *   owner: 'your-github-username',
 *   repoName: 'your-repo-name',
 * });
 */
export default class Github {
  context: GithubContext;

  constructor({ personalAccessToken, owner, repoName }) {
    if (personalAccessToken === undefined || personalAccessToken === null) {
      throw new Error('Input personalAccessToken is undefined or null!');
    }
    if (!owner) {
      throw new Error('Input owner is invalid!');
    }
    if (!repoName) {
      throw new Error('Input repoName is invalid!');
    }

    this.context = {
      personalAccessToken,
      owner,
      repoName,
    };
  }

  getGitHubUrl(path) {
    return `https://github.com/${this.context.owner}/${this.context.repoName}/${path}`;
  }

  /**
   * What is diff between (https://octokit.github.io/rest.js/v18#git-get-blob)
   * ```js
   * octokit.rest.git.getBlob({ owner, repo, file_sha });
   * ```
   * @param {string} sha
   * @param {(new AbortController()).signal} signal
   * @returns {Promise}
   * @private
   */
  getBlob(sha: string, signal?: AbortSignal) {
    return octokit(this.context.personalAccessToken).request(
      'GET /repos/{owner}/{repo}/git/blobs/{sha}',
      {
        owner: this.context.owner,
        repo: this.context.repoName,
        sha,
        request: { signal },
      },
    );
  }

  /**
   * @public
   * @param {*} sha
   * @param {*} signal
   * @returns
   */
  getBlobContentAndSha(sha: string, signal?: AbortSignal) {
    return this.getBlob(sha, signal).then((response) => {
      const obj = JSON.parse(Base64.decode(response.data.content));
      console.debug('@db-man/github getBlobContentAndSha res:', obj);
      return {
        content: obj,
        sha: response.data.sha,
      };
    });
  }

  /**
   * Raw call to `GET /repos/{owner}/{repo}/contents/{path}`, which answers
   * with an **array** of entries when `path` is a dir and a single **object**
   * when it is a file.
   *
   * Use `listDir()` / `getFileRawContent()` unless you specifically need the
   * un-split response. Keeping the two shapes here is deliberate: this is the
   * one place that should have to decide between them.
   *
   * The error messages below are a public contract — consumers render
   * `error.message` to end users. Keep them byte-for-byte: do not reword them,
   * and do not "fix" the `unknow` typo.
   *
   * @param {string} path can be a file or a dir
   * @param {*} signal
   * @returns {Promise<File|Files>}
   */
  getRawContentByPath(path: string, signal?: AbortSignal) {
    return octokit(this.context.personalAccessToken)
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.context.owner,
        repo: this.context.repoName,
        path,
        request: { signal },
      })
      .then(({ data }) => data)
      .catch((err) => {
        console.error('Github.getRawContentByPath failed, err:', err);
        let newErr;
        switch (err.status) {
          case 401:
            newErr = new Error(
              `Failed to get content by path, maybe personal access token is invalid, path: ${path}.`,
            );
            break;
          case 403:
            newErr = new Error(
              `Failed to get content by path, maybe file too large, path: ${path}.`,
            );
            break;
          case 404:
            newErr = new Error(
              `Failed to get content by path, path not found, path: ${path}.`,
            );
            break;
          default:
            newErr = new Error(
              `Failed to get content by path, unknow error, path: ${path}.`,
            );
        }
        newErr.cause = err;
        throw newErr;
      });
  }

  /**
   * Given a dir path, e.g. 'dbs/iam', return the entries under it.
   * Throws when `path` points at a file — the caller asked for a dir.
   * @param {string} path must be a dir
   * @param {*} signal
   * @returns {Promise<FileOrDir[]>}
   * @public
   */
  listDir(path: string, signal?: AbortSignal): Promise<FileOrDir[]> {
    return this.getRawContentByPath(path, signal).then((data) => {
      if (!Array.isArray(data)) {
        throw new Error(
          `listDir failed, path is a file, not a dir, path: ${path}.`,
        );
      }
      return data as FileOrDir[];
    });
  }

  /**
   * Given a file path, e.g. 'dbs/iam/dbcfg.json', return that one file.
   * `content` is in base64 format — that is the GitHub API shape, not a choice
   * made here. Use `getFileContentAndSha()` / `getPlainTextByPath()` to get
   * decoded content.
   * Throws when `path` points at a dir — the caller asked for a file.
   * Because the shape is settled here, callers do NOT need to re-check
   * `Array.isArray(...)` on the result. Same for `listDir()` in the other
   * direction.
   * @param {string} path must be a file
   * @param {*} signal
   * @returns {Promise<RawFileContentAndSha>}
   * @public
   */
  getFileRawContent(
    path: string,
    signal?: AbortSignal,
  ): Promise<RawFileContentAndSha> {
    return this.getRawContentByPath(path, signal).then((data) => {
      if (Array.isArray(data)) {
        throw new Error(
          `getFileRawContent failed, path is a dir, not a file, path: ${path}.`,
        );
      }
      return data as RawFileContentAndSha;
    });
  }

  /**
   * @param {string} path can be a file or a dir
   * @param {*} signal
   * @returns {Promise<[err, File|Files]>}
   */
  getContentByPathV2(path: string, signal?: AbortSignal) {
    return octokit(this.context.personalAccessToken)
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.context.owner,
        repo: this.context.repoName,
        path,
        request: { signal },
      })
      .then(({ data }) => [null, data])
      .catch((err) => {
        const url = this.getGitHubUrl(path);
        switch (err.status) {
          case 404:
            return [
              {
                type: 'FileNotFound',
                message: 'Failed to get file: file not found',
                cause: err,
                url,
              },
              null,
            ];
          case 403:
            return [
              {
                type: 'FileNoPermission',
                message: 'Failed to get file: file too large',
                cause: err,
                url,
              },
              null,
            ];
          default:
            return [
              {
                type: 'FileUknownError',
                message: 'Unknow error when getting file.',
                cause: err,
                url,
              },
              null,
            ];
        }
      });
  }

  /**
   * Get file less than 1MB
   * @param {string} path
   * @returns {Promise}
   */
  getFileContentAndSha(
    path: string,
    signal?: AbortSignal,
  ): Promise<FileContentAndSha> {
    return this.getFileRawContent(path, signal).then((data) => {
      // when data has no content in it, this is not expected in getFileContentAndSha (but no idea why this happens)
      if (!('content' in data) || !data.content) {
        throw new Error(
          'getFileContentAndSha failed, res.content is not in res, check the path param.',
        );
      }
      // TODO: only in GithubDB we have database concept, so in Gitub.ts, we dont use rows concept, consider to remove it to `content`
      let rows = [];
      if (data.content === '') {
        // This is a new empty file, maybe just created
        // TODO may move to GithubDb, because here we assume the file is table data file, so content should be an array, but if it's other file, content may be object or other JSON type.
        rows = [];
      } else {
        rows = JSON.parse(Base64.decode(data.content));
        console.debug('@db-man/github getFileContentAndSha res:', rows);
      }
      return {
        content: rows,
        sha: data.sha,
      };
    });
  }

  /**
   * Get the plain text content of a file, no matter it's a json file or it's a markdown file.
   * The file should be less than 1MB
   * @param {string} path
   * @param {*} signal
   * @returns {Promise}
   */
  getPlainTextByPath(path: string, signal?: AbortSignal): Promise<string> {
    return this.getFileRawContent(path, signal).then((data) => {
      // when data has no content in it, this is not expected in getPlainTextByPath (but no idea why this happens)
      if (!('content' in data) || !data.content) {
        throw new Error(
          'getPlainTextByPath failed, res.content is not in res, check the path param.',
        );
      }

      if (data.content === '') {
        // This is a new empty file, maybe just created
        return '';
      } else {
        return Base64.decode(data.content);
      }
    });
  }

  /**
   * Create a new file at `path`.
   *
   * The file must not exist yet — GitHub answers 422 when it does, and that
   * error is rethrown as-is. Use `saveFile()` to overwrite an existing file.
   *
   * Passing a sha is rejected; see `CreateFileParams.sha`.
   * @param {CreateFileParams} params File content in JSON object
   * @return {Promise<Response>}
   * @public
   */
  async createFile({
    path,
    content,
    message = 'Create file',
    sha,
  }: CreateFileParams) {
    if (sha !== undefined && sha !== null) {
      throw new Error(
        `createFile failed, sha must not be passed, use saveFile() to overwrite the existing file, path: ${path}.`,
      );
    }
    return this.createOrUpdateFile({ path, content, message });
  }

  /**
   * Overwrite the file at `path`, at the version it was read at.
   *
   * `sha` is the guard, not a formality: GitHub answers 409 when the file has
   * changed since that read, and this method turns that into
   * `DBMERR_UPDATE_FILE_409_CONFLICT`. Omitting the sha would silently drop the
   * guard and overwrite whatever is there now, so it is required here.
   * @param {SaveFileParams} params File content in JSON object
   * @return {Promise<Response>}
   * @public
   */
  async saveFile({
    path,
    content,
    sha,
    message = 'Update file',
  }: SaveFileParams) {
    if (sha === undefined || sha === null) {
      throw new Error(
        `saveFile failed, sha is required, use createFile() to create a new file, path: ${path}.`,
      );
    }
    return this.createOrUpdateFile({ path, content, sha, message });
  }

  /**
   * The single write call to `PUT /repos/{owner}/{repo}/contents/{path}`, which
   * creates the file when it is sent no sha and overwrites it when it is sent
   * one.
   *
   * Use `createFile()` / `saveFile()` unless you specifically want both halves
   * behind one door — they each pin one half down, which is the point of them.
   *
   * The 409 message thrown below is `DBMERR_UPDATE_FILE_409_CONFLICT`, a
   * published string that consumers match on. Both its text and its name are
   * fixed: do not reword it, and do not rename the constant to match this
   * method's name.
   * @param {WriteFileParams} params File content in JSON object
   * @return {Promise<Response>}
   * response.commit
   * response.commit.html_url https://github.com/username/reponame/commit/a7f...04d
   * response.content
   * @private
   */
  private async createOrUpdateFile({
    path,
    content,
    sha,
    message,
  }: WriteFileParams) {
    const contentEncoded = Base64.encode(content);
    try {
      const { data } = await octokit(
        this.context.personalAccessToken,
      ).rest.repos.createOrUpdateFileContents({
        // replace the owner and email with your own details
        owner: this.context.owner,
        repo: this.context.repoName,
        path,
        sha,
        message,
        content: contentEncoded,
        committer,
        author,
      });
      return data;
    } catch (error) {
      // A network-level failure carries no `response`; plain `error.response`
      // would throw a TypeError here and lose the original error.
      switch (error?.response?.status) {
        case 409:
          /**
           * case 1: when updateing an existing file, but the sha is an old one
           * ```json
           * {
           *   "message": "dbs_dir/db_name/table_name.data.json does not match c61...e3a",
           *   "documentation_url": "https://docs.github.com/rest/reference/repos#create-or-update-file-contents",
           *   "status": "409"
           * }
           * ```
           *
           * case 2: when creating a new file, but creating 2 different file at the same time, below is example response
           * ```json
           * {
           *   "message": "is at 78c...942 but expected b59...979",
           *   "documentation_url": "https://docs.github.com/rest/repos/contents#create-or-update-file-contents",
           *   "status": "409"
           * }
           * ```
           *
           * How to resolve case 2, here is one note from GitHub API doc:
           * > If you use this endpoint and the "Delete a file" endpoint in parallel, the concurrent requests will conflict and you will receive errors. You must use these endpoints serially instead.
           */

          throw new Error(DBMERR_UPDATE_FILE_409_CONFLICT);
        default:
          throw error;
      }
    }
  }

  /**
   * @return {Promise<Response>}
   * response.commit
   * response.commit.html_url https://github.com/username/reponame/commit/a7f...04d
   * response.content
   */
  async deleteFile({ path, sha, message = 'Delete file' }: DeleteFileType) {
    try {
      // https://octokit.github.io/rest.js/v18#repos-delete-file
      const { data } = await octokit(
        this.context.personalAccessToken,
      ).rest.repos.deleteFile({
        owner: this.context.owner,
        repo: this.context.repoName,
        path,
        message,
        sha,
        committer,
        author,
      });
      return data;
    } catch (error) {
      console.error('Failed to octokit.rest.repos.deleteFile, error:', error);
      // A network-level failure carries no `response`; plain `error.response`
      // would throw a TypeError here and lose the original error.
      switch (error?.response?.status) {
        case 409:
          /**
           * case 1: when deleting an existing file, but the sha is an old one
           * ```json
           * {
           *   "message": "dbs_dir/db_name/table_name.data.json does not match c61...e3a",
           *   "documentation_url": "https://docs.github.com/rest/reference/repos#create-or-update-file-contents",
           *   "status": "409"
           * }
           * ```
           */
          throw new Error(DBMERR_DELETE_FILE_409_CONFLICT);
        default:
          throw error;
      }
    }
  }

  /**
   * Get content of the "dbs.json" file in the repo root dir
   * @returns
   */
  getDbsCfg(): Promise<DbsCfgContentAndShaType> {
    return this.getFileRawContent(DBS_CFG_FILENAME).then((data) => {
      // when data has no content in it, this is not expected in getDbsCfg (but no idea why this happens)
      if (!('content' in data) || !data.content) {
        throw new Error(
          'getDbsCfg failed, res.content is not in res, check the path param.',
        );
      }

      if (data.content === '') {
        // This is a new empty file, maybe just created
        // But file format is not valid, so we need to throw an error
        // TODO may move to GithubDb, because here we assume the file is table data file, so content should be an array, but if it's other file, content may be object or other JSON type.
        throw new Error('getDbsCfg failed, dbs.json file content is empty.');
      }

      // TODO: only in GithubDB we have database concept, so in Gitub.ts, we dont use rows concept, consider to remove it to `content`
      const cfg = JSON.parse(Base64.decode(data.content));
      console.debug('@db-man/github getFileContentAndSha res:', cfg);

      return {
        content: cfg,
        sha: data.sha,
      };
    });
  }
}
