import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';

import Settings from '../pages/Settings';
import AppLayout from './AppLayout';
import Databases from '../types/Databases';
import { LS_KEY_DBS_SCHEMA } from '../constants';
import { AppContext } from '../contexts/AppContext';

const { defaultAlgorithm, darkAlgorithm } = theme;

export default function App() {
  const [dbs, setDbs] = useState<Databases>({});

  useEffect(() => {
    const _dbs = JSON.parse(localStorage.getItem(LS_KEY_DBS_SCHEMA) || '{}');
    setDbs(_dbs);
  }, []);

  if (!dbs) return <Settings />;
  return (
    <AppContext.Provider value={{ dbs }}>
      <BrowserRouter>
        <ConfigProvider
          theme={{
            algorithm:
              localStorage.getItem('dm_dark_theme') === 'true'
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
