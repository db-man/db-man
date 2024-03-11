import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { utils } from '@db-man/github';

import * as constants from '../constants';
import { getUrlParams } from '../utils';
import PageContext from '../contexts/page';
import { Typography } from 'antd';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

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
      .map((column, idx) => (
        <span key={idx}>
          <Text>{`${column.referenceTable}(`}</Text>
          <a
            key='create-link'
            href={`/${dbName}/${column.referenceTable}/create`}
          >
            Create
          </a>
          <Text>,</Text>
          <a key='list-link' href={`/${dbName}/${column.referenceTable}/list`}>
            List
          </a>
          <Text>{`) | `}</Text>
        </span>
      ));
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
      {`${utils.validFilename(id)}.json`}
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
      <Text>NavBar:</Text> <span> </span>
      <span> </span>
      <span>
        <Text>{tableName}</Text>
        <Text>( </Text>
        <span>{createLink}</span>
        <Text>,</Text>
        <span>{updateOrGetLink}</span>
        <Text>,</Text>
        <span>{listLink}</span>
        <Text>)</Text>
      </span>
      <Text> | </Text>
      <span>
        <Text>Ref tables</Text>
        <Text>: </Text>
        <Text>(</Text>
        <span>{renderReferenceTableLink()}</span>
        <Text>)</Text>
      </span>
      <Text> | </Text>
      {/* GitHub link of DB table file, e.g. "dbs/iam/users.data.json" */}
      <Text>GitHub Link: </Text>
      <a
        title='GitHub File Path'
        href={githubDb?.getDataUrl(dbName, tableName)}
        target='_blank'
        rel='noreferrer'
      >
        {githubDb?.getDataPath(dbName, tableName)}
      </a>
      {aaa && (
        <>
          <Text>::</Text>
          {aaa}
        </>
      )}
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
