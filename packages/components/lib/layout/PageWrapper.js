function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
const {
  Provider
} = PageContext;
const mapp = {
  list: ListPage,
  random: RandomPage,
  create: CreatePage,
  update: UpdatePage,
  get: GetPage,
  tagsCloud: TagsCloudPage,
  tableConfig: TableConfigPage
};
export function TableList({
  dbName
}) {
  if (!getDbs()) return null;
  const tablesOfSelectedDb = getDbs()[dbName];
  return /*#__PURE__*/React.createElement("div", null, tablesOfSelectedDb.map(({
    name: tName
  }) => /*#__PURE__*/React.createElement("li", {
    key: tName
  }, /*#__PURE__*/React.createElement(Link, {
    to: `/${dbName}/${tName}`
  }, tName))));
}
export function ActionList({
  dbName,
  tableName
}) {
  return /*#__PURE__*/React.createElement("div", null, "List of actions in table:", ['list', 'create'].map(action => /*#__PURE__*/React.createElement("li", {
    key: action
  }, /*#__PURE__*/React.createElement(Link, {
    to: `/${dbName}/${tableName}/${action}`
  }, action))));
}
/**
 * To render list/create/update page for `/db_name/table_name.json`
 */

export default class PageWrapper extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "getOnlineData", async () => {
      try {
        this.setState({
          loading: true
        });
        const tables = await githubDb.getDbTablesSchemaAsync(this.props.dbName);
        console.debug('use online columns', tables);
        this.setState({
          tables
        });
      } catch (error) {
        console.error('Failed to get column JSON file in List component, error:', error);
        message.error('Failed to get online columns definition!');
      }

      this.setState({
        loading: false
      });
    });

    _defineProperty(this, "getOfflineData", () => {
      if (!localStorage.getItem(constants.LS_KEY_DBS_SCHEMA)) {
        this.setState({
          errMsg: 'No DBS schema defined in localStorage!'
        });
        return;
      }

      const tables = JSON.parse(localStorage.getItem(constants.LS_KEY_DBS_SCHEMA))[this.props.dbName];
      this.setState({
        tables
      });
    });

    _defineProperty(this, "renderTableListInDb", () => /*#__PURE__*/React.createElement("div", null, "List of tables in DB:", /*#__PURE__*/React.createElement(TableList, {
      dbName: this.props.dbName
    })));

    _defineProperty(this, "renderActionInTable", () => /*#__PURE__*/React.createElement(ActionList, {
      dbName: this.props.dbName,
      tableName: this.props.tableName
    }));

    this.state = {
      // tables is got from db repo db_name/columns.json which contain all tables column definition in current database
      tables: [],
      loading: false
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

    const {
      action,
      tableName
    } = this.pageInfo;
    document.title = `${action} ${tableName}`;
  }

  get columns() {
    const {
      dbName,
      tableName
    } = this.props;
    const tablesOfSelectedDb = getTablesByDbName(dbName);
    if (!tablesOfSelectedDb) return [];
    const currentTable = tablesOfSelectedDb.find(table => table.name === tableName);
    if (!currentTable) return [];
    return currentTable.columns;
  }

  get pageInfo() {
    const {
      dbName,
      tableName,
      action
    } = this.props;
    return {
      appModes: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES) ? localStorage.getItem(constants.LS_KEY_GITHUB_REPO_MODES).split(',') : [],
      dbs: getDbs(),
      dbName,
      tableName,
      action,
      columns: this.columns,
      primaryKey: getPrimaryKey(this.columns),
      tables: getTablesByDbName(dbName)
    };
  }

  render() {
    const {
      dbName,
      tableName,
      action
    } = this.props;
    const {
      loading,
      tables,
      errMsg
    } = this.state; // if (!tableName) {
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
      return /*#__PURE__*/React.createElement("div", {
        className: "dm-page-v2 err-msg"
      }, errMsgs.join(' ,'));
    }

    const PageComponent = mapp[action];

    if (!PageComponent) {
      return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, "404 - PageComponent Not Found"), /*#__PURE__*/React.createElement("div", null, `/${dbName}/${tableName}/${action}`));
    }

    if (loading) {
      return /*#__PURE__*/React.createElement(Spin, {
        tip: "loading columns in PageWrapper"
      });
    }

    return /*#__PURE__*/React.createElement(Provider, {
      value: this.pageInfo
    }, /*#__PURE__*/React.createElement("div", {
      className: "dm-page-v2"
    }, /*#__PURE__*/React.createElement(PageComponent, {
      dbName: dbName,
      tableName: tableName,
      action: action,
      tables: tables
    }), /*#__PURE__*/React.createElement(NavBar, null)));
  }

}