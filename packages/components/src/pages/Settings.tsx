import React from 'react';

import DbConnections from '../components/DbConnections';
import useTitle from '../hooks/useTitle';
import { Switch, Typography } from 'antd';

// Use `Typography` so can apply dark theme to text
const { Title, Text } = Typography;

/**
 * To save online db tables schema in the local db, then pages could load faster
 */
const Settings = () => {
  useTitle('Settings - db-man');

  const [isDarkTheme, setIsDarkTheme] = React.useState(
    localStorage.getItem('dbm_is_dark_theme') === 'true'
  );

  const onChange = (checked: boolean) => {
    setIsDarkTheme(checked);
    localStorage.setItem('dbm_is_dark_theme', checked ? 'true' : 'false');
    window.location.reload();
  };

  return (
    <div>
      <Title level={1}>Setting</Title>
      <Title level={2}>Theme</Title>
      <Text>Dark Theme: </Text>
      <Switch checked={isDarkTheme} onChange={onChange} />
      <DbConnections
        storage={{
          set: (k, v) => window.localStorage.setItem(k, v),
          get: (k) => window.localStorage.getItem(k),
        }}
      />
    </div>
  );
};

export default Settings;
