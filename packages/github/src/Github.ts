import { Base64 } from 'js-base64';

import octokit from './octokit';

type GithubContext = {
  personalAccessToken: string;
  owner: string;
  repoName: string;
};

const botName = 'db-man-bot';
const committer = {
  name: botName,
  email: 'bot-email',
};
const author = {
  name: botName,
  email: 'bot-email',
};

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
  getBlob(sha, signal) {
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
  getBlobContentAndSha(sha, signal) {
    return this.getBlob(sha, signal).then((response) => ({
      content: JSON.parse(Base64.decode(response.data.content)),
      sha: response.data.sha,
    }));
  }

  /**
   * TODO maybe function name should be "getFilesInPath"
   * Given path 'dbs/iam', return all files in this path
   * Given path 'dbs/iam/dbcfg.json', return this file
   * @param {string} path can be a file or a dir
   * @param {*} signal
   * @returns {Promise<File|Files>}
   * @public
   */
  getPath(path: string, signal?: AbortSignal) {
    return octokit(this.context.personalAccessToken)
      .request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: this.context.owner,
        repo: this.context.repoName,
        path,
        request: { signal },
      })
      .then(({ data }) => data)
      .catch((err) => {
        console.error('getPath failed, err:', err);
        let newErr;
        switch (err.status) {
          case 404:
            newErr = new Error(
              `Failed to get path: path not found, path: ${path}`
            );
            break;
          case 403:
            newErr = new Error(
              `Failed to get path: maybe file too large, path: ${path}`
            );
            break;
          default:
            newErr = new Error('Unknow error when getting file.');
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
  getPathV2(path: string, signal?: AbortSignal) {
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
  getFileContentAndSha(path: string, signal?: AbortSignal) {
    return this.getPath(path, signal).then((data) => {
      // when path is a dir, data is an array, this is not expected in getFileContentAndSha
      if (Array.isArray(data)) {
        throw new Error(
          'getFileContentAndSha failed, res is an array, the path param should be a file, not a dir.'
        );
      }
      // when data is not array, but no content in it, this is not expected in getFileContentAndSha (but no idea why this happens)
      if (!('content' in data)) {
        throw new Error(
          'getFileContentAndSha failed, res.content is not in res, check the path param.'
        );
      }
      let rows = [];
      if (data.content === '') {
        // This is a new empty file, maybe just created
        // TODO may move to GithubDb, because here we assume the file is table data file, so content should be an array, but if it's other file, content may be object or other JSON type.
        rows = [];
      } else {
        rows = JSON.parse(Base64.decode(data.content));
      }
      return {
        content: rows,
        sha: data.sha,
      };
    });
  }

  /**
   * @param {Object} content File content in JSON object
   * @return {Promise<Response>}
   * response.commit
   * response.commit.html_url https://github.com/username/reponame/commit/a7f...04d
   * response.content
   */
  async updateFile(path, content, sha, msg = 'Update file') {
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
        message: `[db-man] ${msg}`,
        content: contentEncoded,
        committer,
        author,
      });
      return data;
    } catch (error) {
      console.error('Failed to createOrUpdateFileContents, error:', error);
      switch (error.response.status) {
        case 409:
          // error.response.data={"message": "dbs_dir/db_name/table_name.data.json does not match c61...e3a","documentation_url": "https://docs.github.com/rest/reference/repos#create-or-update-file-contents"}
          // error.response.status=409
          // file.json does not match c61...e3a
          throw new Error('Status: 409 Conflict');
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
  async deleteFile(path, sha) {
    try {
      // https://octokit.github.io/rest.js/v18#repos-delete-file
      const { data } = await octokit(
        this.context.personalAccessToken
      ).rest.repos.deleteFile({
        owner: this.context.owner,
        repo: this.context.repoName,
        path,
        message: '[db-man] delete file',
        sha,
        committer,
        author,
      });
      return data;
    } catch (error) {
      console.error('Failed to octokit.rest.repos.deleteFile, error:', error);
      switch (error.response.status) {
        case 409:
          // error.response.data={"message": "dbs_dir/db_name/table_name.data.json does not match c61...e3a","documentation_url": "https://docs.github.com/rest/reference/repos#create-or-update-file-contents"}
          // error.response.status=409
          // file.json does not match c61...e3a
          throw new Error('Status: 409 Conflict');
        default:
          throw error;
      }
    }
  }
}
