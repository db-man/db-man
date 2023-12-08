import React from 'react';
import Databases from '../types/Databases';

export interface AppContextProps {
  dbs: Databases;
}

export const AppContext = React.createContext<AppContextProps | null>(null);

export const useAppContext = (): AppContextProps => {
  const context = React.useContext(AppContext);
  if (context === null) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};
