import React from 'react';
import { Button, Input } from 'antd';

import * as constants from '../constants';
import reloadDbsSchemaAsync from './helpers';
import EditableTable from '../components/EditableTable';

const handleClick = () => {
  reloadDbsSchemaAsync().then(() => {
  });
};

function DbActions() {
  if (!localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH)) {
    return null;
  }
  return (
    <div style={{ display: 'none' }}>
      Load dbs schema from github to local db
      {' '}
      <Button onClick={handleClick}>Load DBs</Button>
    </div>
  );
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
    this.state = {
      owner: '',
      repo: '',
      personalToken: '',
      path: '',
    };
  }

  componentDidMount() {
    this.setState({
      owner: localStorage.getItem(constants.LS_KEY_GITHUB_OWNER),
      repo: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME),
      personalToken: localStorage.getItem(
        constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN,
      ),
      path: localStorage.getItem(constants.LS_KEY_GITHUB_REPO_PATH),
    });

    this.backupTitle = document.title;
    document.title = 'Settings - db-man';
  }

  componentWillUnmount() {
    document.title = this.backupTitle;
  }

  handleSavePath = () => {
    const {
      owner, repo, personalToken, path,
    } = this.state;
    localStorage.setItem(constants.LS_KEY_GITHUB_OWNER, owner);
    localStorage.setItem(constants.LS_KEY_GITHUB_REPO_NAME, repo);
    localStorage.setItem(
      constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN,
      personalToken,
    );
    localStorage.setItem(constants.LS_KEY_GITHUB_REPO_PATH, path);
  };

  handleChange = (key) => (event) => this.setState({ [key]: event.target.value });

  // handleLoadDbs = () => {
  //   reloadDbsSchemaAsync();
  // };

  render() {
    const {
      owner, personalToken, repo, path,
    } = this.state;

    return (
      <div>
        <h1>Settings</h1>
        <h2>Database Connections</h2>
        <EditableTable onEnable={onEnable} />
        <div style={{ display: 'none' }}>
          Owner:
          {' '}
          <Input
            placeholder="e.g. user_name"
            value={owner}
            onChange={this.handleChange('owner')}
          />
          {' '}
          <br />
          Personal token:
          {' '}
          <Input
            placeholder="e.g. 123"
            value={personalToken}
            onChange={this.handleChange('personalToken')}
          />
          {' '}
          <br />
          Repo:
          {' '}
          <Input
            placeholder="e.g. repo_name"
            value={repo}
            onChange={this.handleChange('repo')}
          />
          {' '}
          <br />
          Path:
          {' '}
          <Input
            placeholder="e.g. dbs_path"
            value={path}
            onChange={this.handleChange('path')}
          />
          {' '}
          (A path in a github repo)
          <br />
          <Button onClick={this.handleSavePath}>Save</Button>
        </div>
        <DbActions />
      </div>
    );
  }
}
