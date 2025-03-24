import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Settings from '../pages/Settings';
import Demos from '../pages/Demos';
import QueryPage from '../pages/Query';
import CreateDbPage from '../pages/CreateDb';
import CreateTablePage from '../pages/CreateTable';
import ViewPage from '../pages/ViewPage';
import IframePageWrapper from './IframePageWrapper';
import Database from './DbTableLayout/Database';
import Table from './DbTableLayout/Table';
import Action from './DbTableLayout/Action';
import ComponentDemo from './ComponentDemo';
import PageLayout from './PageLayout';
import CommonPageWrapper from './CommonPageWrapper';
import TableManagementPage from '../pages/TableManagement';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/iframe/:dbName/:tableName/:action"
        element={<IframePageWrapper />}
      />
      <Route path="/" element={<PageLayout />}>
        <Route path="settings" element={<Settings />} />
        <Route
          path="query"
          element={
            <CommonPageWrapper>
              <QueryPage />
            </CommonPageWrapper>
          }
        />
        <Route
          path="create-db"
          element={
            <CommonPageWrapper>
              <CreateDbPage />
            </CommonPageWrapper>
          }
        />
        <Route path="demos" element={<Demos />}>
          <Route path=":component" element={<ComponentDemo />} />
        </Route>
        <Route
          path="_views/:dbName/:viewName"
          element={
            <CommonPageWrapper>
              <ViewPage />
            </CommonPageWrapper>
          }
        />
        <Route
          path="_management/:dbName/create"
          element={
            <CommonPageWrapper>
              <CreateTablePage />
            </CommonPageWrapper>
          }
        />
        <Route
          path="_management/:dbName/:tableName"
          element={
            <CommonPageWrapper>
              <TableManagementPage />
            </CommonPageWrapper>
          }
        />
        {/* example path: /iam/users/list */}
        <Route path=":dbName" element={<Database />}>
          <Route path=":tableName" element={<Table />}>
            <Route path=":action" element={<Action />} />
            {/**
             TODO: try split the action to different route
             <Route path='/list' element={<ListPage />} />
             <Route path='/create' element={<CreatePage />} />
             */}
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
