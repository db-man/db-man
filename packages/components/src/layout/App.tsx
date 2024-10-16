import React, { useEffect, useState } from 'react';

import { types } from '@db-man/github';
import { ConfigProvider, theme } from 'antd';
import { BrowserRouter } from 'react-router-dom';

import Settings from '../pages/Settings';
import AppLayout from './AppLayout';
import { LS_IS_DARK_THEME, LS_KEY_DBS_SCHEMA } from '../constants';
import { AppContext } from '../contexts/AppContext';

const { defaultAlgorithm, darkAlgorithm } = theme;

export default function App() {
  const [dbs, setDbs] = useState<types.DatabaseMap | null>(null);

  useEffect(() => {
    const _dbs = JSON.parse(localStorage.getItem(LS_KEY_DBS_SCHEMA) || '{}');
    setDbs(_dbs);

    if (localStorage.getItem(LS_IS_DARK_THEME) === 'true') {
      document.body.style.backgroundColor = 'black';
    }
  }, []);

  if (!dbs) return <Settings />;
  return (
    <AppContext.Provider
      value={{
        dbs,
        getTablesByDbName: (dbName: string) => {
          return dbs[dbName].tables || [];
        },
        getViewsByDbName: (dbName: string) => {
          return dbs[dbName].views || [];
        },
        getViewByDbNameViewName: (dbName: string, viewName: string) => {
          const { views } = dbs[dbName];
          if (!views) {
            return null;
          }
          return views.find(({ name }) => name === viewName) || null;
        },
      }}
    >
      <BrowserRouter>
        <ConfigProvider
          theme={{
            algorithm:
              localStorage.getItem(LS_IS_DARK_THEME) === 'true'
                ? darkAlgorithm
                : defaultAlgorithm,
          }}
        >
          <AppLayout />
        </ConfigProvider>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
