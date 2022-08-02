function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React from 'react';
import { Button, Input } from 'antd';
import * as constants from '../constants';
import reloadDbsSchemaAsync from './helpers';
import EditableTable from '../components/EditableTable';

const handleClick = () => {
  reloadDbsSchemaAsync().then(() => {});
};

function DbActions() {
  if (!localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH)) {
    return null;
  }

  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'none'
    }
  }, "Load dbs schema from github to local db", ' ', /*#__PURE__*/React.createElement(Button, {
    onClick: handleClick
  }, "Load DBs"));
}

const onEnable = () => {
  handleClick();
};
/**
 * To save online db tables schema in the local db, then pages could load faster
 */


export default class Settings extends React.Component {
  constructor(props) {
    super(props);

    _defineProperty(this, "handleSavePath", () => {
      const {
        owner,
        repo,
        personalToken,
        path
      } = this.state;
      localStorage.setItem(constants.LS_KEY_GITHUB_OWNER, owner);
      localStorage.setItem(constants.LS_KEY_GITHUB_REPO_NAME, repo);
      localStorage.setItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN, personalToken);
      localStorage.setItem(constants.LS_KEY_GITHUB_REPO_PATH, path);
    });

    _defineProperty(this, "handleChange", key => event => this.setState({
      [key]: event.target.value
    }));

    this.state = {
      owner: '',
      repo: '',
      personalToken: '',
      path: ''
    };
  }

  componentDidMount() {
    this.setState({
      owner: localStorage.getItem(constants.LS_KEY_GITHUB_OWNER),
      repo: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME),
      personalToken: localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN),
      path: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH)
    });
    this.backupTitle = document.title;
    document.title = 'Settings - db-man';
  }

  componentWillUnmount() {
    document.title = this.backupTitle;
  }

  // handleLoadDbs = () => {
  //   reloadDbsSchemaAsync();
  // };
  render() {
    const {
      owner,
      personalToken,
      repo,
      path
    } = this.state;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Settings"), /*#__PURE__*/React.createElement("h2", null, "Database Connections"), /*#__PURE__*/React.createElement(EditableTable, {
      onEnable: onEnable
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'none'
      }
    }, "Owner:", ' ', /*#__PURE__*/React.createElement(Input, {
      placeholder: "e.g. user_name",
      value: owner,
      onChange: this.handleChange('owner')
    }), ' ', /*#__PURE__*/React.createElement("br", null), "Personal token:", ' ', /*#__PURE__*/React.createElement(Input, {
      placeholder: "e.g. 123",
      value: personalToken,
      onChange: this.handleChange('personalToken')
    }), ' ', /*#__PURE__*/React.createElement("br", null), "Repo:", ' ', /*#__PURE__*/React.createElement(Input, {
      placeholder: "e.g. repo_name",
      value: repo,
      onChange: this.handleChange('repo')
    }), ' ', /*#__PURE__*/React.createElement("br", null), "Path:", ' ', /*#__PURE__*/React.createElement(Input, {
      placeholder: "e.g. dbs_path",
      value: path,
      onChange: this.handleChange('path')
    }), ' ', "(A path in a github repo)", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Button, {
      onClick: this.handleSavePath
    }, "Save")), /*#__PURE__*/React.createElement(DbActions, null));
  }

}