import React from 'react';
import { Routes, Route } from 'react-router-dom';

import IframePageWrapper from './IframePageWrapper';
import Database from './Database';
import Table from './Table';
import Action from './Action';
import Settings from '../pages/Settings';
import Demos from '../pages/Demos';
import PageLayout from './PageLayout';

export default function AppLayout() {
  return (
    <Routes>
      <Route
        path='/iframe/:dbName/:tableName/:action'
        element={<IframePageWrapper />}
      />
      <Route path='/' element={<PageLayout />}>
        <Route path='settings' element={<Settings />} />
        <Route path='demos' element={<Demos />} />
        <Route path=':dbName' element={<Database />}>
          <Route path=':tableName' element={<Table />}>
            <Route path=':action' element={<Action />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
