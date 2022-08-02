import React from 'react';
import { Link } from 'react-router-dom';
import { utils as githubUtils, githubDb } from '@db-man/github';

import * as constants from '../constants';
import { getUrlParams } from '../utils';
import PageContext from '../contexts/page';

/**
 * This component depends on page context, so only used in Application/Page
 * TODO `id` in URL is used in this component, so not all pages could use this component
 */
export default class NavBar extends React.Component {
  renderReferenceTableLink = () => {
    const { columns, dbName } = this.context;
    return columns
      .filter((column) => column.referenceTable)
      .map((column) => [
        `${column.referenceTable}(`,
        <a
          key="create-link"
          href={`/${dbName}/${column.referenceTable}/create`}
        >
          Create
        </a>,
        ',',
        <a
          key="list-link"
          href={`/${dbName}/${column.referenceTable}/list`}
        >
          List
        </a>,
        ') | ',
      ]);
  };

  render() {
    const {
      dbName, tableName, action, primaryKey,
    } = this.context;

    const id = getUrlParams()[primaryKey];
    const filter = encodeURIComponent(
      JSON.stringify({
        [primaryKey]: id,
      }),
    );

    return (
      <div className="dm-nav-bar">
        NavBar: github(
        {id ? (
          <a
            title="GitHub File Path"
            href={githubUtils.getGitHubFullPath(
              `${localStorage.getItem(
                constants.LS_KEY_GITHUB_REPO_PATH,
              )}/${dbName}/${tableName}/${githubDb.validFilename(id)}.json`,
            )}
            target="_blank"
            rel="noreferrer"
          >
            GitHub Path
          </a>
        ) : null}
        )
        {' '}
        {tableName}
        (
        <Link to={{ pathname: `/${dbName}/${tableName}/create` }}>Create</Link>
        ,
        <Link
          to={{
            pathname: `/${dbName}/${tableName}/${
              action === 'get' ? 'update' : 'get'
            }`,
            search: `?${primaryKey}=${id}`,
          }}
        >
          {action === 'get' ? 'Update' : 'Get'}
        </Link>
        ,
        <Link
          to={{
            pathname: `/${dbName}/${tableName}/list`,
            search: `?filter=${filter}`,
          }}
        >
          List
        </Link>
        ) | Ref tables:
        {' '}
        {this.renderReferenceTableLink()}
        {githubDb.getDataPath(dbName, tableName)}
        :
        {' '}
        <a
          title="GitHub File Path"
          href={githubDb.getDataUrl(dbName, tableName)}
          target="_blank"
          rel="noreferrer"
        >
          GitHub Path
        </a>
        {' '}
        |
        {' '}
        <a
          title="Commit History"
          href={githubUtils.getGitHubHistoryPath(
            githubDb.getDataPath(dbName, tableName),
          )}
          target="_blank"
          rel="noreferrer"
        >
          Commit History
        </a>
      </div>
    );
  }
}

NavBar.contextType = PageContext;
