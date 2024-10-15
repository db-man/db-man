import React from 'react';

import { types } from '@db-man/github';

export interface AppContextProps {
  dbs: types.DatabaseMap;
  getTablesByDbName: (dbName: string) => types.DbTable[];
}

export const AppContext = React.createContext<AppContextProps | null>(null);

export const useAppContext = (): AppContextProps => {
  const context = React.useContext(AppContext);
  if (context === null) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};
