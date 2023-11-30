/* eslint-disable react/prop-types, react/destructuring-assignment, max-len, no-console, react/no-unused-class-component-methods */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { message, Spin } from 'antd';
import { GithubDb } from '@db-man/github';

import { getTablesByDbName } from '../dbs';
import * as constants from '../constants';
import { getPrimaryKey } from '../utils';
import PageContext from '../contexts/page';
import NavBar from '../components/NavBar';
import CreatePage from '../components/CreatePage';
import UpdatePage from '../components/UpdatePage';
import ListPage from '../components/ListPage';
import RandomPage from '../components/RandomPage';
import TagsCloudPage from '../components/TagsCloudPage';
import GetPage from '../components/GetPage';
import TableConfigPage from '../components/TableConfigPage';
import QueryPage from '../components/QueryPage';
import { useAppContext } from '../contexts/AppContext';
import DbTable from '../types/DbTable';

const { Provider } = PageContext;

const mapp: {
  [key: string]: React.ComponentType<{
    dbName: string;
    tableName: string;
    action: string;
    tables: DbTable[];
  }>;
} = {
  list: ListPage,
  random: RandomPage,
  create: CreatePage,
  update: UpdatePage,
  get: GetPage,
  tagsCloud: TagsCloudPage,
  tableConfig: TableConfigPage,
  query: QueryPage,
};

export function TableList({ dbName }: { dbName: string }) {
  const { dbs } = useAppContext();
  if (!dbs) return null;
  const tablesOfSelectedDb = dbs[dbName];
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
 */
const PageWrapper = (props: {
  dbName?: string;
  tableName?: string;
  action?: string;
}) => {
  // tables is got from db repo db_name/columns.json which contain all tables column definition in current database
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const githubDbRef = useRef(
    new GithubDb({
      personalAccessToken: localStorage.getItem(
        constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN
      ),
      repoPath: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH),
      owner: localStorage.getItem(constants.LS_KEY_GITHUB_OWNER),
      repoName: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME),
      dbsSchema: localStorage.getItem(constants.LS_KEY_DBS_SCHEMA),
    })
  );

  useEffect(() => {
    // TODO we could get online and offline at the same time
    // then we only use offline data to render
    // then we compare the offline data with online data, if there is any diff, we show alert
    const onlineEnabled = false;
    if (onlineEnabled) {
      getOnlineData();
    } else {
      getOfflineData();
    }

    const { action, tableName } = pageInfo();
    document.title = `${action} ${tableName}`;
  }, []);

  const columns = () => {
    const { dbName, tableName } = props;
    const tablesOfSelectedDb = getTablesByDbName(dbName);
    if (!tablesOfSelectedDb) return [];
    const currentTable = tablesOfSelectedDb.find(
      (table: DbTable) => table.name === tableName
    );
    if (!currentTable) return [];
    return currentTable.columns;
  };

  const pageInfo = () => {
    const { dbName, tableName, action } = props;
    return {
      // e.g. ['split-table']
      appModes: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)
        ? localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES)!.split(',')
        : [],
      dbName: dbName || '',
      tableName: tableName || '',
      action: action || '',
      columns: columns(),
      primaryKey: getPrimaryKey(columns()),
      tables: getTablesByDbName(dbName),
      githubDb: githubDbRef.current,
    };
  };

  const getOnlineData = async () => {
    try {
      setLoading(true);
      const _tables = await githubDbRef.current.getDbTablesSchemaAsync(
        props.dbName
      );
      console.debug('use online columns', _tables);
      setTables(_tables);
    } catch (error) {
      console.error(
        'Failed to get column JSON file in List component, error:',
        error
      );
      message.error('Failed to get online columns definition!');
    }
    setLoading(false);
  };

  const getOfflineData = () => {
    if (!localStorage.getItem(constants.LS_KEY_DBS_SCHEMA)) {
      setErrMsg('No DBS schema defined in localStorage!');
      return;
    }
    const _tables = JSON.parse(
      localStorage.getItem(constants.LS_KEY_DBS_SCHEMA) || '{}'
    )[props.dbName || ''];
    setTables(_tables);
  };

  const renderTableListInDb = () => (
    <div>
      List of tables in DB:
      <TableList dbName={props.dbName || ''} />
    </div>
  );

  const renderActionInTable = () => (
    <ActionList dbName={props.dbName || ''} tableName={props.tableName || ''} />
  );

  const { dbName, tableName, action } = props;

  // if (!tableName) {
  //   return this.renderTableListInDb();
  // }

  // if (!action) {
  //   return this.renderActionInTable();
  // }

  const errMsgs = [];
  if (errMsg) {
    errMsgs.push(errMsg);
  }
  if (!dbName) {
    errMsgs.push('dbName is undefined!');
  }
  if (getPrimaryKey(columns()) === null) {
    errMsgs.push('Primary key not found on table!');
  }
  if (columns().length === 0) {
    errMsgs.push('No columns found for this table!');
  }

  if (errMsgs.length > 0) {
    return <div className='dm-page-v2 err-msg'>{errMsgs.join(' ,')}</div>;
  }

  const PageComponent = mapp[action || ''];

  if (!PageComponent) {
    return (
      <div>
        <div>404 - PageComponent Not Found</div>
        <div>{`/${dbName}/${tableName}/${action}`}</div>
      </div>
    );
  }

  if (loading) {
    return <Spin tip='loading columns in PageWrapper'>Loading...</Spin>;
  }

  return (
    <Provider value={pageInfo()}>
      <div className='dm-page-v2'>
        {/* Pass tableName down, so child component to rerender according to this props */}
        <PageComponent
          dbName={dbName || ''}
          tableName={tableName || ''}
          action={action || ''}
          tables={tables}
        />
        <NavBar />
      </div>
    </Provider>
  );
};

export default PageWrapper;
