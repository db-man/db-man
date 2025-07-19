import React, { useState } from 'react';

import { UserOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

import { useAppContext } from '../contexts/AppContext';

interface LeftSideMenuProps {
  dbName: string;
  tableName?: string;
  action?: string;
  viewName?: string;
}

const VIEWS_KEY = 'views';

const encodeViewKey = (dbName: string, viewName: string) =>
  `_views-${dbName}-${viewName}`;
const encodeTableActionKey = (
  dbName: string,
  tableName: string,
  action?: string
) => `${dbName}-${tableName}-${action}`;

const LeftSideMenu: React.FC<LeftSideMenuProps> = ({
  dbName,
  tableName = '',
  action = '',
  viewName,
}) => {
  const { getTablesByDbName, getViewsByDbName } = useAppContext();

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    // if view name exist, then expand the menu of views
    if (viewName) {
      return [VIEWS_KEY];
    }
    // if table name not given, then collapse all menus
    if (!tableName) {
      return [];
    }
    // if table name not exist in all tables, then collapse all menus
    // if table name exist, then expand the menu of this table
    const table = getTablesByDbName(dbName).find(
      ({ name }) => name === tableName
    );
    return table ? [table.name] : [];
  });

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // if table name not given, then no menu item should be selected
  let selectedKeys;
  if (viewName) {
    selectedKeys = [encodeViewKey(dbName, viewName)];
  } else {
    selectedKeys = tableName
      ? [encodeTableActionKey(dbName, tableName, action)]
      : [];
  }
  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      style={{ height: '100%', borderRight: 0 }}
      onOpenChange={handleOpenChange}
      items={[
        ...getTablesByDbName(dbName).map(({ name: tName }) => ({
          key: tName,
          label: tName,
          icon: <UserOutlined />,
          children: [
            {
              key: encodeTableActionKey(dbName, tName, 'list'),
              label: <Link to={`/${dbName}/${tName}/list`}>List</Link>,
            },
            {
              key: encodeTableActionKey(dbName, tName, 'create'),
              label: <Link to={`/${dbName}/${tName}/create`}>Create</Link>,
            },
            {
              key: encodeTableActionKey(dbName, tName, 'schema'),
              label: <Link to={`/${dbName}/${tName}/schema`}>Schema</Link>,
            },
            {
              key: encodeTableActionKey(dbName, tName, 'query'),
              label: <Link to={`/${dbName}/${tName}/query`}>Query</Link>,
            },
            {
              key: encodeTableActionKey(dbName, tName, 'insights'),
              label: <Link to={`/${dbName}/${tName}/insights`}>Insights</Link>,
            },
          ],
        })),
        {
          key: VIEWS_KEY,
          label: 'Views',
          icon: <UserOutlined />,
          children: getViewsByDbName(dbName).map(({ name: vName }) => ({
            key: encodeViewKey(dbName, vName),
            label: <Link to={`/_views/${dbName}/${vName}`}>{vName}</Link>,
          })),
        },
        // create table
        {
          key: 'management',
          label: 'Management',
          icon: <UserOutlined />,
          children: [
            {
              key: 'create-table',
              label: (
                <Link to={`/_management/${dbName}/create`}>Create Table</Link>
              ),
            },
          ],
        },
      ]}
    />
  );
};

export default LeftSideMenu;
