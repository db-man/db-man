import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import { dbs } from '../dbs';

export default class LeftSideMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openKeys: [],
    };
  }

  handleOpenChange = (openKeys) => {
    this.setState({ openKeys });
  };

  render() {
    if (!dbs) {
      return null;
    }

    const { dbName, tableName, action } = this.props;
    const tablesOfSelectedDb = dbs[dbName];

    if (!tablesOfSelectedDb) {
      return null;
    }

    const firstTableOfSelectedDb = tablesOfSelectedDb[0];

    const selectedKeys = [`${dbName}-${tableName}-${action}`];
    let openKeys = [firstTableOfSelectedDb.name];
    if (tableName) {
      openKeys = [tableName];
    }
    const { openKeys: openKeys2 } = this.state;
    if (openKeys2.length > 0) {
      openKeys = openKeys2;
    }

    return (
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        style={{ height: '100%', borderRight: 0 }}
        onOpenChange={this.handleOpenChange}
        items={tablesOfSelectedDb.map(({ name: tName }) => (
          {
            label: tName,
            icon: <UserOutlined />,
            children: [
              { key: `${dbName}-${tName}-list`, label: <Link to={`/${dbName}/${tName}/list`}>List</Link> },
              { key: `${dbName}-${tName}-create`, label: <Link to={`/${dbName}/${tName}/create`}>Create</Link> },
              { key: `${dbName}-${tName}-random`, label: <Link to={`/${dbName}/${tName}/random`}>Random</Link> },
              { key: `${dbName}-${tName}-tagsCloud`, label: <Link to={`/${dbName}/${tName}/tagsCloud`}>tagsCloud</Link> },
              { key: `${dbName}-${tName}-tableConfig`, label: <Link to={`/${dbName}/${tName}/tableConfig`}>tableConfig</Link> },
            ],
          }
        ))}
      />
    );
  }
}

LeftSideMenu.propTypes = {
  dbName: PropTypes.string.isRequired,
  tableName: PropTypes.string,
  action: PropTypes.string,
};

LeftSideMenu.defaultProps = {
  tableName: '',
  action: '',
};
