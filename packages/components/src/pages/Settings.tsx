import React from 'react';

import DbConnections from '../components/DbConnections';
import useTitle from '../hooks/useTitle';

/**
 * To save online db tables schema in the local db, then pages could load faster
 */
const Settings = () => {
  useTitle('Settings - db-man');

  return (
    <div>
      <h1>Settings</h1>
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
