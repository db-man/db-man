/* eslint-disable react/destructuring-assignment, no-console, max-len */

import React from 'react';
import { message, Alert, Spin } from 'antd';
import { githubDb } from '@db-man/github';
import * as utils from '../../utils';
import PageContext from '../../contexts/page';

import Detail from './Detail';

export default class GetPageBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contentLoading: false,
      contentLoaded: false,
      // table rows from github db
      rows: null,
      refTables: {},

      errorMessage: '',

      // One record in table rows
      record: {},
    };
  }

  componentDidMount() {
    const { dbName, tableName } = this.context;
    this.fetchData(dbName, tableName);
  }

  // componentDidUpdate(prevProps) {
  //   // When URL changed, dbName or tableName changed, then load data from backend
  //   if (
  //     this.context.dbName !== prevProps.dbName
  //     || this.context.tableName !== prevProps.tableName
  //   ) {
  //     this.fetchData(this.context.dbName, this.context.tableName);
  //   }
  // }

  fetchData = (dbName, tableName) => {
    this.setState({ contentLoading: true });
    const defaultTableRequestPromise = githubDb
      .getTableRows(dbName, tableName)
      .then(({ content }) => {
        this.setState({
          rows: content,
        });
        return content;
      })
      .then((tableRows) => {
        this.setState({
          contentLoaded: true,
          record: this.getInitialFormFields(tableRows),
        });
      })
      .catch((err) => {
        console.error('getTableRows failed, err:', err);
        message.error('something wrong in getTableRows');
      });

    const getRefTablePromises = this.context.columns
      .filter(({ referenceTable }) => referenceTable)
      .map(({ referenceTable }) => githubDb.getTableRows(dbName, referenceTable).then(({ content }) => {
        const { refTables } = this.state;
        refTables[`ref:${referenceTable}:rows`] = content; // TODO
        this.setState({
          refTables,
        });
      }));

    console.debug('Start getting all table data...');
    Promise.all([defaultTableRequestPromise, ...getRefTablePromises]).then(
      () => {
        console.debug('Finish getting all table data...');
        this.setState({ contentLoading: false });
      },
    );
  };

  // Create the initial form fields according to whether create/update.
  getInitialFormFields = (tableRows) => {
    const foundRows = tableRows.filter(
      (item) => item[this.context.primaryKey]
        === utils.getUrlParams()[this.context.primaryKey],
    );

    if (foundRows.length === 0) {
      this.setState({ errorMessage: 'item not found in db' });
      return null;
    }
    if (foundRows.length > 1) {
      this.setState({ errorMessage: 'more than 1 rows' });
      return null;
    }

    return {
      ...foundRows[0],
    };
  };

  renderAlert = () => this.state.errorMessage && (
  <Alert message={this.state.errorMessage} type="error" />
  );

  renderDetail = () => {
    if (this.state.record === null) {
      return null;
    }
    return (
      <Detail
        defaultValues={this.state.record}
        rows={this.state.rows}
        tables={this.context.tables}
        refTables={this.state.refTables}
      />
    );
  };

  render() {
    if (this.state.contentLoading) {
      return <Spin />;
    }

    if (!this.state.contentLoaded) {
      return null;
    }

    return (
      <div className="get-body-component">
        {this.renderAlert()}
        {this.renderDetail()}
      </div>
    );
  }
}

GetPageBody.contextType = PageContext;
