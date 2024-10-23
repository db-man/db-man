import React from 'react';

import { Typography } from 'antd';

import DbConnections from './DbConnections';
import useTitle from '../../hooks/useTitle';
import SettingSwitch from './SettingSwitch';
import { LS_IS_DARK_THEME, LS_SHOW_DOWNLOAD_BUTTON } from '../../constants';

// Use `Typography` so can apply dark theme to text
const { Title } = Typography;

/**
 * To save online db tables schema in the local db, then pages could load faster
 */
const Settings = () => {
  useTitle('Settings - db-man');

  return (
    <div>
      <Title level={1}>Settings</Title>
      <Title level={2}>Configs</Title>
      <SettingSwitch label='Dark Theme' storageKey={LS_IS_DARK_THEME} />
      <SettingSwitch
        label='Show Download Button'
        storageKey={LS_SHOW_DOWNLOAD_BUTTON}
      />
      <DbConnections
        storage={{
          set: (k, v) => window.localStorage.setItem(k, v),
          get: (k) => window.localStorage.getItem(k),
          remove: (k) => window.localStorage.removeItem(k),
        }}
      />
    </div>
  );
};

export default Settings;
