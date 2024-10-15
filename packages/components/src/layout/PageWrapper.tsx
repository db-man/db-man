/* eslint-disable react/prop-types, react/destructuring-assignment, max-len, no-console, react/no-unused-class-component-methods */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import { GithubDb } from '@db-man/github';

import { getColumns, getPrimaryKey, getTablesByDbName } from '../dbs';
import * as constants from '../constants';
import PageContext from '../contexts/page';
import NavBar from '../components/NavBar';
import { useAppContext } from '../contexts/AppContext';
import { actionToComponentMapping } from '../pages';

const { Provider } = PageContext;

export function TableList({ dbName }: { dbName: string }) {
  const { dbs, getTablesByDbName } = useAppContext();
  if (!dbs) return null;
  const tablesOfSelectedDb = getTablesByDbName(dbName);
  return (
    <div>
      {tablesOfSelectedDb.map(({ name: tName }) => (
        <li key={tName}>
          <Link to={`/${dbName}/${tName}`}>{tName}</Link>
        </li>
      ))}
    </div>
  );
}

export function ActionList({
  dbName,
  tableName,
}: {
  dbName: string;
  tableName: string;
}) {
  return (
    <div>
      List of actions in table:
      {['list', 'create'].map((action) => (
        <li key={action}>
          <Link to={`/${dbName}/${tableName}/${action}`}>{action}</Link>
        </li>
      ))}
    </div>
  );
}

/**
 * To render list/create/update page for `/db_name/table_name.json`
 * TODO: Change name to DbTablePageWrapper, so it's more clear that this is not a common page wrapper
 */
const PageWrapper = (props: {
  dbName?: string;
  tableName?: string;
  action?: string;
}) => {
  const [errMsg, setErrMsg] = useState('');
  const githubDbRef = useRef(
    new GithubDb({
      personalAccessToken:
        localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN) ||
        '',
      repoPath: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH) || '',
      owner: localStorage.getItem(constants.LS_KEY_GITHUB_OWNER) || '',
      repoName: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME) || '',
      dbsSchema: localStorage.getItem(constants.LS_KEY_DBS_SCHEMA) || '',
    })
  );

  const { dbName, tableName, action } = props;

  useEffect(() => {
    getDbSchema();

    document.title = `${action} ${tableName}`;
  }, []);

  const columns = getColumns({ dbName, tableName });
  const primaryKey = getPrimaryKey(columns);

  const pageInfo = () => {
    return {
      // e.g. ['split-table']
      appModes: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)
        ? localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)!.split(',')
        : [],
      dbName: dbName || '',
      tableName: tableName || '',
      action: action || '',
      columns,
      primaryKey,
      tables: getTablesByDbName(dbName),
      githubDb: githubDbRef.current,
    };
  };

  // get online and offline at the same time
  // then we only use offline data to render
  // compare the offline data with online data, if there is any diff, we show alert
  const getDbSchema = async () => {
    const offlineDbSchema = JSON.parse(
      localStorage.getItem(constants.LS_KEY_DBS_SCHEMA) || '{}'
    )[props.dbName || ''];
    const onlineDbSchema = await githubDbRef.current.getDbTablesSchemaAsync(
      props.dbName
    );

    if (offlineDbSchema && onlineDbSchema) {
      const offlineDbSchemaStr = JSON.stringify(offlineDbSchema);
      const onlineDbSchemaStr = JSON.stringify(onlineDbSchema);

      if (offlineDbSchemaStr !== onlineDbSchemaStr) {
        console.warn('Offline and online schema are different!');
        console.warn('offlineDbSchema:', offlineDbSchema);
        console.warn('onlineDbSchema:', onlineDbSchema);
        message.warning(
          <span>
            Offline and online schema are different!{' '}
            <a href='/settings'>Go to Settings</a>
          </span>
        );
      }
    }
  };

  const errMsgs = [];
  if (errMsg) {
    errMsgs.push(errMsg);
  }
  if (!dbName) {
    errMsgs.push('dbName is undefined!');
  }
  if (primaryKey === null) {
    errMsgs.push('Primary key not found on table!');
  }
  if (columns.length === 0) {
    errMsgs.push('No columns found for this table!');
  }

  if (errMsgs.length > 0) {
    return <div className='dbm-page-v2 err-msg'>{errMsgs.join(' ,')}</div>;
  }

  const PageComponent = actionToComponentMapping[action || ''];

  if (!PageComponent) {
    return (
      <div>
        <div>404 - PageComponent Not Found</div>
        <div>{`/${dbName}/${tableName}/${action}`}</div>
      </div>
    );
  }

  return (
    <Provider value={pageInfo()}>
      <div className='dbm-page-v2'>
        {/* Pass tableName down, so child component to rerender according to this props */}
        <PageComponent dbName={dbName || ''} tableName={tableName || ''} />
        <NavBar />
      </div>
    </Provider>
  );
};

export default PageWrapper;
