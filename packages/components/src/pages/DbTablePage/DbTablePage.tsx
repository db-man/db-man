/* eslint-disable react/prop-types, react/destructuring-assignment, max-len, no-console, react/no-unused-class-component-methods */

import { useEffect, useRef } from 'react';

import { GithubDb } from '@db-man/github';
import { message } from 'antd';

import { getColumns, getPrimaryKey, getTablesByDbName } from '../../dbs';
import * as constants from '../../constants';
import PageContext from '../../contexts/page';
import { actionToComponentMapping } from './pages';
import NavBar from './NavBar';

const { Provider } = PageContext;

/**
 * To render list/create/update page for a real db table, e.g. `/iam/users.data.json`
 */
const DbTablePage = (props: {
  dbName: string;
  tableName?: string;
  action?: string;
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  const githubDbRef = useRef(
    new GithubDb({
      personalAccessToken:
        localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN) ||
        '',
      repoPath: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH) || '',
      owner: localStorage.getItem(constants.LS_KEY_GITHUB_OWNER) || '',
      repoName: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME) || '',
      dbsSchema: JSON.parse(
        localStorage.getItem(constants.LS_KEY_DBS_SCHEMA) || '{}'
      ),
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
      // TODO: move this to app context
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
        messageApi.warning(
          <span>
            Offline and online schema are different!{' '}
            <a href='/settings'>Go to Settings</a>
          </span>
        );
      }
    }
  };

  const errMsgs = [];
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
        {contextHolder}
        {/* Pass tableName down, so child component to rerender according to this props */}
        <PageComponent dbName={dbName || ''} tableName={tableName || ''} />
        <NavBar />
      </div>
    </Provider>
  );
};

export default DbTablePage;
