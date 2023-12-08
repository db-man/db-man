import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Databases from '../types/Databases';
import { useAppContext } from '../contexts/AppContext';

interface LeftSideMenuProps {
  dbName: string;
  tableName?: string;
  action?: string;
}

const LeftSideMenu: React.FC<LeftSideMenuProps> = ({
  dbName,
  tableName,
  action,
}) => {
  const { dbs }: { dbs: Databases } = useAppContext();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  if (!dbs) {
    return null;
  }

  const tablesOfSelectedDb = dbs[dbName];
  if (!tablesOfSelectedDb) {
    return null;
  }

  const firstTableOfSelectedDb = tablesOfSelectedDb[0];

  const selectedKeys = [`${dbName}-${tableName}-${action}`];
  let openKeys3 = [firstTableOfSelectedDb.name];
  if (tableName) {
    openKeys3 = [tableName];
  }
  if (openKeys.length > 0) {
    openKeys3 = openKeys;
  }

  return (
    <Menu
      mode='inline'
      selectedKeys={selectedKeys}
      openKeys={openKeys3}
      style={{ height: '100%', borderRight: 0 }}
      onOpenChange={handleOpenChange}
      items={tablesOfSelectedDb.map(({ name: tName }) => ({
        key: tName,
        label: tName,
        icon: <UserOutlined />,
        children: [
          {
            key: `${dbName}-${tName}-list`,
            label: <Link to={`/${dbName}/${tName}/list`}>List</Link>,
          },
          {
            key: `${dbName}-${tName}-create`,
            label: <Link to={`/${dbName}/${tName}/create`}>Create</Link>,
          },
          {
            key: `${dbName}-${tName}-random`,
            label: <Link to={`/${dbName}/${tName}/random`}>Random</Link>,
          },
          {
            key: `${dbName}-${tName}-tagsCloud`,
            label: <Link to={`/${dbName}/${tName}/tagsCloud`}>tagsCloud</Link>,
          },
          {
            key: `${dbName}-${tName}-tableConfig`,
            label: (
              <Link to={`/${dbName}/${tName}/tableConfig`}>tableConfig</Link>
            ),
          },
          {
            key: `${dbName}-${tName}-query`,
            label: <Link to={`/${dbName}/${tName}/query`}>Query</Link>,
          },
        ],
      }))}
    />
  );
};

LeftSideMenu.propTypes = {
  dbName: PropTypes.string.isRequired,
  tableName: PropTypes.string,
  action: PropTypes.string,
};

LeftSideMenu.defaultProps = {
  tableName: '',
  action: '',
};

export default LeftSideMenu;
