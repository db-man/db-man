/* eslint-disable react/prop-types, react/destructuring-assignment, max-len, no-console, react/no-unused-class-component-methods */

import React from 'react';
import { Link } from 'react-router-dom';
import { message, Spin } from 'antd';
import { githubDb } from '@db-man/github';

import { getDbs, getTablesByDbName } from '../dbs';
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

const { Provider } = PageContext;

const mapp = {
  list: ListPage,
  random: RandomPage,
  create: CreatePage,
  update: UpdatePage,
  get: GetPage,
  tagsCloud: TagsCloudPage,
  tableConfig: TableConfigPage,
};

export function TableList({ dbName }) {
  if (!getDbs()) return null;
  const tablesOfSelectedDb = getDbs()[dbName];
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

export function ActionList({ dbName, tableName }) {
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
export default class PageWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // tables is got from db repo db_name/columns.json which contain all tables column definition in current database
      tables: [],
      loading: false,
    };
  }

  componentDidMount() {
    // TODO we could get online and offline at the same time
    // then we only use offline data to render
    // then we compare the offline data with online data, if there is any diff, we show alert
    const onlineEnabled = false;
    if (onlineEnabled) {
      this.getOnlineData();
    } else {
      this.getOfflineData();
    }

    const { action, tableName } = this.pageInfo;
    document.title = `${action} ${tableName}`;
  }

  get columns() {
    const { dbName, tableName } = this.props;
    const tablesOfSelectedDb = getTablesByDbName(dbName);
    if (!tablesOfSelectedDb) return [];
    const currentTable = tablesOfSelectedDb.find(
      (table) => table.name === tableName,
    );
    if (!currentTable) return [];
    return currentTable.columns;
  }

  get pageInfo() {
    const { dbName, tableName, action } = this.props;
    return {
      appModes: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES) ? localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES).split(',') : [],
      dbs: getDbs(),
      dbName,
      tableName,
      action,
      columns: this.columns,
      primaryKey: getPrimaryKey(this.columns),
      tables: getTablesByDbName(dbName),
    };
  }

  getOnlineData = async () => {
    try {
      this.setState({ loading: true });
      const tables = await githubDb.getDbTablesSchemaAsync(this.props.dbName);
      console.debug('use online columns', tables);
      this.setState({
        tables,
      });
    } catch (error) {
      console.error(
        'Failed to get column JSON file in List component, error:',
        error,
      );
      message.error('Failed to get online columns definition!');
    }
    this.setState({ loading: false });
  };

  getOfflineData = () => {
    if (!localStorage.getItem(constants.LS_KEY_DBS_SCHEMA)) {
      this.setState({ errMsg: 'No DBS schema defined in localStorage!' });
      return;
    }
    const tables = JSON.parse(
      localStorage.getItem(constants.LS_KEY_DBS_SCHEMA),
    )[this.props.dbName];
    this.setState({
      tables,
    });
  };

  renderTableListInDb = () => (
    <div>
      List of tables in DB:
      <TableList dbName={this.props.dbName} />
    </div>
  );

  renderActionInTable = () => (
    <ActionList dbName={this.props.dbName} tableName={this.props.tableName} />
  );

  render() {
    const { dbName, tableName, action } = this.props;
    const { loading, tables, errMsg } = this.state;

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
    if (getPrimaryKey(this.columns) === null) {
      errMsgs.push('Primary key not found on table!');
    }
    if (this.columns.length === 0) {
      errMsgs.push('No columns found for this table!');
    }

    if (errMsgs.length > 0) {
      return (
        <div className="dm-page-v2 err-msg">
          {errMsgs.join(' ,')}
        </div>
      );
    }

    const PageComponent = mapp[action];

    if (!PageComponent) {
      return (
        <div>
          <div>404 - PageComponent Not Found</div>
          <div>{`/${dbName}/${tableName}/${action}`}</div>
        </div>
      );
    }

    if (loading) {
      return <Spin tip="loading columns in PageWrapper" />;
    }

    return (
      <Provider value={this.pageInfo}>
        <div className="dm-page-v2">
          {/* Pass tableName down, so child component to rerender according to this props */}
          <PageComponent
            dbName={dbName}
            tableName={tableName}
            action={action}
            tables={tables}
          />
          <NavBar />
        </div>
      </Provider>
    );
  }
}
