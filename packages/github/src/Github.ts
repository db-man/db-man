// @ts-ignore TODO Cannot find module 'js-base64' or its corresponding type declarations.ts(2307)
import { Base64 } from 'js-base64';

import octokit from './octokit';
import {
  DbsCfgContentAndShaType,
  DeleteFileType,
  FileContentAndSha,
  RawFileContentAndSha,
  UpdateFileType,
} from './types';
import { DBS_CFG_FILENAME } from './constants';

type GithubContext = {
  personalAccessToken: string;
  owner: string;
  repoName: string;
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
      }
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
   * Given path 'dbs/iam', return all files in this path
   * Given path 'dbs/iam/dbcfg.json', return this file
   * TODO:
   *   - change name from getContentByPath to getRawContentByPath, because content is in base64 format
   *   - should have a better name, for example sometimess this function is used to get all files under a dir
   * @param {string} path can be a file or a dir
   * @param {*} signal
   * @returns {Promise<File|Files>}
   * @public
   */
  getContentByPath(path: string, signal?: AbortSignal) {
    return octokit(this.context.personalAccessToken)
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.context.owner,
        repo: this.context.repoName,
        path,
        request: { signal },
      })
      .then(({ data }) => data as RawFileContentAndSha)
      .catch((err) => {
        console.error('Github.getContentByPath failed, err:', err);
        let newErr;
        switch (err.status) {
          case 401:
            newErr = new Error(
              `Failed to get content by path, maybe personal access token is invalid, path: ${path}.`
            );
            break;
          case 403:
            newErr = new Error(
              `Failed to get content by path, maybe file too large, path: ${path}.`
            );
            break;
          case 404:
            newErr = new Error(
              `Failed to get content by path, path not found, path: ${path}.`
            );
            break;
          default:
            newErr = new Error(
              `Failed to get content by path, unknow error, path: ${path}.`
            );
        }
        newErr.cause = err;
        throw newErr;
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
    signal?: AbortSignal
  ): Promise<FileContentAndSha> {
    return this.getContentByPath(path, signal).then((data) => {
      // when path is a dir, data is an array, this is not expected in getFileContentAndSha
      if (Array.isArray(data)) {
        throw new Error(
          'getFileContentAndSha failed, res is an array, the path param should be a file, not a dir.'
        );
      }
      // when data is not array, but no content in it, this is not expected in getFileContentAndSha (but no idea why this happens)
      if (!('content' in data) || !data.content) {
        throw new Error(
          'getFileContentAndSha failed, res.content is not in res, check the path param.'
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
   * Create or update a file
   * TODO should rename the function name because it can also create a file
   * @param {Object} content File content in JSON object
   * @return {Promise<Response>}
   * response.commit
   * response.commit.html_url https://github.com/username/reponame/commit/a7f...04d
   * response.content
   */
  async updateFile({
    path,
    content,
    sha,
    message = 'Update file',
  }: UpdateFileType) {
    const contentEncoded = Base64.encode(content);
    try {
      const { data } = await octokit(
        this.context.personalAccessToken
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
      switch (error.response.status) {
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
        this.context.personalAccessToken
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
      switch (error.response.status) {
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
    // return this.getFileContentAndSha(DBS_CFG_FILENAME).then(
    //   (res: FileContentAndSha) => {
    //     return res;
    //   }
    // );
    return this.getContentByPath(DBS_CFG_FILENAME).then((data) => {
      // when path is a dir, data is an array, this is not expected in getDbsCfg
      if (Array.isArray(data)) {
        throw new Error(
          'getDbsCfg failed, res is an array, the path param should be a file, not a dir.'
        );
      }
      // when data is not array, but no content in it, this is not expected in getDbsCfg (but no idea why this happens)
      if (!('content' in data) || !data.content) {
        throw new Error(
          'getDbsCfg failed, res.content is not in res, check the path param.'
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
