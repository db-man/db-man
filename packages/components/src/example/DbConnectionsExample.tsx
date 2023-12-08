import React from 'react';
import { DbConnections, constants } from '../lib';

const SettingsExample = () => {
  const dbSchema = JSON.parse(
    localStorage.getItem(constants.LS_KEY_DBS_SCHEMA) || '{}'
  );

  if (dbSchema) {
    return (
      <div>
        <p>App will use this DB schema to render features.</p>
        <pre style={{ fontSize: 10 }}>{JSON.stringify(dbSchema, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'red' }}>No DB schema found, please create one.</p>
      <div>
        <DbConnections
          storage={{
            set: (k, v) => window.localStorage.setItem(k, v),
            get: (k) => window.localStorage.getItem(k),
          }}
        />
      </div>
    </div>
  );
};

export default SettingsExample;
