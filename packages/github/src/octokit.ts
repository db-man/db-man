import { Octokit } from '@octokit/rest';

/**
 * Why using "@octokit/rest" instead of "octokit"?
 *
 * By enabling @octokit/rest, we dont need to wait 3 retry after 409 conflict error.
 *
 * ```js
 * import { Octokit } from "octokit";
 * let octokit = new Octokit({ auth: '' });
 *```
 */

const octokit = (auth: string) => new Octokit({ auth });

export default octokit;
