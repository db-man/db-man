import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { utils } from '@db-man/github';

import * as constants from '../constants';
import { getUrlParams } from '../utils';
import PageContext from '../contexts/page';

/**
 * This component depends on page context, so only used in Application/Page
 * TODO `id` in URL is used in this component, so not all pages could use this component
 */
const NavBar = () => {
  const { dbName, tableName, action, primaryKey, githubDb, columns } =
    useContext(PageContext);

  const renderReferenceTableLink = () => {
    return columns
      .filter((column) => column.referenceTable)
      .map((column) => [
        `${column.referenceTable}(`,
        <a
          key='create-link'
          href={`/${dbName}/${column.referenceTable}/create`}
        >
          Create
        </a>,
        ',',
        <a key='list-link' href={`/${dbName}/${column.referenceTable}/list`}>
          List
        </a>,
        ') | ',
      ]);
  };

  const id = getUrlParams()[primaryKey];
  const filter = encodeURIComponent(
    JSON.stringify({
      [primaryKey]: id,
    })
  );

  // Only when appModes have "split-table"
  const aaa = id ? (
    <a
      title='GitHub File Path'
      href={githubDb?.getGitHubFullPath(
        `${localStorage.getItem(
          constants.LS_KEY_GITHUB_REPO_PATH
        )}/${dbName}/${tableName}/${utils.validFilename(id)}.json`
      )}
      target='_blank'
      rel='noreferrer'
    >
      GitHub Path
    </a>
  ) : null;

  const createLink = (
    <Link to={{ pathname: `/${dbName}/${tableName}/create` }}>Create</Link>
  );
  const updateOrGetLink = (
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
  );
  const listLink = (
    <Link
      to={{
        pathname: `/${dbName}/${tableName}/list`,
        search: `?filter=${filter}`,
      }}
    >
      List
    </Link>
  );

  return (
    <div className='dm-nav-bar'>
      NavBar:
      <span> </span>
      <span>
        <span>github</span>
        <span>(</span>
        <span>{aaa}</span>
        <span>)</span>
      </span>
      <span> </span>
      <span>
        <span>{tableName}</span>
        <span>( </span>
        <span>{createLink}</span>
        <span>,</span>
        <span>{updateOrGetLink}</span>
        <span>,</span>
        <span>{listLink}</span>
        <span>)</span>
      </span>
      <span> | </span>
      <span>
        <span>Ref tables</span>
        <span>: </span>
        <span>(</span>
        <span>{renderReferenceTableLink()}</span>
        <span>)</span>
      </span>
      <span> | </span>
      <a
        title='GitHub File Path'
        href={githubDb?.getDataUrl(dbName, tableName)}
        target='_blank'
        rel='noreferrer'
      >
        {githubDb?.getDataPath(dbName, tableName)}
      </a>
      {/* (
        <a
          title="Commit History"
          href={githubUtils.getGitHubHistoryPath(
            githubDb.getDataPath(dbName, tableName),
          )}
          target="_blank"
          rel="noreferrer"
        >
          history
        </a>
        ) */}
    </div>
  );
};

export default NavBar;
