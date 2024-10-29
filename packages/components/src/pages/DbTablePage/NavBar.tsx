import React, { useContext } from 'react';

import { Typography } from 'antd';
import { Link } from 'react-router-dom';
import { utils } from '@db-man/github';

import * as constants from '../../constants';
import { getUrlParams } from '../../utils';
import PageContext from '../../contexts/page';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

/**
 * This component depends on page context, so only used in Application/Page
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
          <Text>{`)`}</Text>
        </span>
      ));
  };

  const primaryKeyVal = getUrlParams()[primaryKey];
  const filter = encodeURIComponent(
    JSON.stringify({
      [primaryKey]: primaryKeyVal,
    })
  );

  // Only when appModes have "split-table"
  const githubFileLink = primaryKeyVal ? (
    <a
      title='GitHub File Path'
      href={githubDb?.getGitHubFullPath(
        `${localStorage.getItem(
          constants.LS_KEY_GITHUB_REPO_PATH
        )}/${dbName}/${tableName}/${utils.validFilename(primaryKeyVal)}.json`
      )}
      target='_blank'
      rel='noreferrer'
    >
      {`${utils.validFilename(primaryKeyVal)}.json`}
    </a>
  ) : null;

  const createLink = (
    <Link to={{ pathname: `/${dbName}/${tableName}/create` }}>Create</Link>
  );
  // primary key value can contain special characters like '#'
  // but for <Link> component, for the search part, '#' is not allowed
  // so need to encodeURI the primary key value
  const updateOrGetLink = (
    <Link
      to={{
        pathname: `/${dbName}/${tableName}/${
          action === 'get' ? 'update' : 'get'
        }`,
        search: `?${primaryKey}=${encodeURIComponent(primaryKeyVal)}`,
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
    <div className='dbm-nav-bar'>
      <span>
        <Text>Table: {tableName} (</Text>
        <span>{createLink}</span>
        <Text>,</Text>
        <span>{updateOrGetLink}</span>
        <Text>,</Text>
        <span>{listLink}</span>
        <Text>)</Text>
      </span>
      <Text> | </Text>
      <span>
        <Text>Ref tables: [</Text>
        <span>{renderReferenceTableLink()}</span>
        <Text>]</Text>
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
      {githubFileLink && (
        <>
          <Text>::</Text>
          {githubFileLink}
        </>
      )}
    </div>
  );
};

export default NavBar;
