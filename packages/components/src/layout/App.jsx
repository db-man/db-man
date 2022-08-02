import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import * as constants from '../constants';
import Settings from '../pages/Settings';
import AppLayout from './AppLayout';

export default function App() {
  const dbs = JSON.parse(localStorage.getItem(constants.LS_KEY_DBS_SCHEMA));
  if (!dbs) return <Settings />;
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
