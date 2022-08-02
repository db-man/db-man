function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-disable react/destructuring-assignment, no-console, max-len, react/no-unused-class-component-methods */
import React from 'react';
import { message, Spin, Skeleton, Alert } from 'antd';
import { githubDb } from '@db-man/github';
import { utils as dbManUtils } from 'db-man';
import { validatePrimaryKey } from './Form/helpers';
import SuccessMessage from './SuccessMessage';
import * as utils from '../utils';
import Form from './Form';
import PageContext from '../contexts/page';
import * as constants from '../constants';
export default class CreatePageBody extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "handleFormSubmit", formValues => {
      if (!this.isSplitTable) {
        this.updateTableFileAsync(formValues);
      } else {
        this.createRecordFileAsync(formValues);
      }
    });

    _defineProperty(this, "updateTableFileAsync", async formValues => {
      let newContent = [...this.state.rows];

      if (!this.formValidation(this.state.rows, formValues)) {
        return;
      }

      newContent = this.getNewContent(formValues, newContent);
      this.setState({
        saveLoading: true
      });

      try {
        const {
          commit
        } = await githubDb.updateTableFile(this.context.dbName, this.context.tableName, newContent, this.state.tableFileSha);
        message.success( /*#__PURE__*/React.createElement(SuccessMessage, {
          url: commit.html_url
        }), 10);
      } catch (err) {
        console.error('updateTableFile, err:', err);
        this.setState({
          errorMessage: 'Failed to update table file on server!'
        });
      }

      this.setState({
        saveLoading: false
      });
    });

    _defineProperty(this, "createRecordFileAsync", async formValues => {
      const {
        dbName,
        tableName,
        primaryKey
      } = this.context;
      const {
        recordFileSha
      } = this.state;
      this.setState({
        saveLoading: true
      });

      try {
        const {
          commit
        } = await githubDb.updateRecordFile(dbName, tableName, primaryKey, formValues, recordFileSha);
        message.success( /*#__PURE__*/React.createElement(SuccessMessage, {
          url: commit.html_url
        }), 10);
      } catch (err) {
        console.error('updateRecordFile, err:', err);
        this.setState({
          errorMessage: 'Failed to update record file on server!'
        });
      }

      this.setState({
        saveLoading: false
      });
    });

    _defineProperty(this, "getData", () => {
      Promise.all([this.getTableFileAsync()]);
    });

    _defineProperty(this, "getTableFileAsync", async () => {
      this.setState({
        tableFileLoading: true
      });

      try {
        const {
          content: rows,
          sha: tableFileSha
        } = await githubDb.getTableRows(this.context.dbName, this.context.tableName);
        this.setState({
          rows,
          tableFileSha
        });
        const fields = this.getInitialFormFields();
        this.setState({
          defaultFormValues: { ...this.state.defaultFormValues,
            // eslint-disable-line react/no-access-state-in-setstate
            ...fields
          }
        });
      } catch (err) {
        console.error('getTableRows, error:', err);
        this.setState({
          errorMessage: 'Failed to get table file from server!'
        });
      }

      this.setState({
        tableFileLoading: false
      });
    });

    _defineProperty(this, "getInitialFormFields", () => {
      const fields = {}; // Fill the form field with URL params

      this.context.columns.filter(col => utils.getUrlParams()[col.id]).forEach(col => {
        if (col.type === constants.STRING_ARRAY) {
          fields[col.id] = [utils.getUrlParams()[col.id]];
        } else {
          fields[col.id] = utils.getUrlParams()[col.id];
        }
      });
      return fields;
    });

    _defineProperty(this, "getNewContent", (formValues, newContent) => {
      newContent.push({ ...formValues,
        createdAt: dbManUtils.formatDate(new Date()),
        updatedAt: dbManUtils.formatDate(new Date())
      });
      return newContent; // eslint-disable-line consistent-return
    });

    _defineProperty(this, "formValidation", (rows, formValues) => {
      if (!validatePrimaryKey(formValues[this.context.primaryKey], rows, this.context.primaryKey)) {
        this.warnPrimaryKeyInvalid(formValues[this.context.primaryKey]);
        return false;
      }

      return true;
    });

    _defineProperty(this, "warnPrimaryKeyInvalid", value => message.warn( /*#__PURE__*/React.createElement("div", null, "Found duplicated item in db", ' ', /*#__PURE__*/React.createElement("a", {
      href: `/${this.context.dbName}/${this.context.tableName}/update?${this.context.primaryKey}=${value}`
    }, value)), 10));

    _defineProperty(this, "renderAlert", () => this.state.errorMessage && /*#__PURE__*/React.createElement(Alert, {
      message: this.state.errorMessage,
      type: "error"
    }));

    _defineProperty(this, "renderForm", () => {
      if (this.loading) {
        return /*#__PURE__*/React.createElement(Spin, {
          tip: `Loading file: ${this.context.dbName}/${this.context.tableName}`
        });
      }

      return /*#__PURE__*/React.createElement(Form, {
        defaultValues: this.state.defaultFormValues,
        rows: this.state.rows,
        loading: this.state.saveLoading,
        onSubmit: this.handleFormSubmit
      });
    });

    this.state = {
      errorMessage: '',
      // all rows in table file
      tableFileLoading: false,
      rows: [],
      tableFileSha: null,
      defaultFormValues: {},
      saveLoading: false
    };
  }

  componentDidMount() {
    this.getData();
  } // `updateTableFileAsync` to update the whole table file, it's too big, and take more time to get the response from server
  // `createRecordFileAsync` to only create record file, file is small, so get response quickly, but backend (github action) need to merge records into big table file


  get loading() {
    return this.state.tableFileLoading || this.state.recordFileLoading;
  }

  get isSplitTable() {
    const {
      appModes
    } = this.context;
    return appModes.indexOf('split-table') !== -1;
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "create-page-body-component"
    }, /*#__PURE__*/React.createElement(Skeleton, {
      loading: this.loading
    }, this.renderAlert(), this.renderForm()));
  }

}
CreatePageBody.contextType = PageContext;