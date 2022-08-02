import React from 'react';
import { Routes, Route } from 'react-router-dom';
import IframePageWrapper from './IframePageWrapper';
import Database from './Database';
import Table from './Table';
import Action from './Action';
import Settings from '../pages/Settings';
import PageLayout from './PageLayout';
export default function AppLayout() {
  return /*#__PURE__*/React.createElement(Routes, null, /*#__PURE__*/React.createElement(Route, {
    path: "/iframe/:dbName/:tableName/:action",
    element: /*#__PURE__*/React.createElement(IframePageWrapper, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/",
    element: /*#__PURE__*/React.createElement(PageLayout, null)
  }, /*#__PURE__*/React.createElement(Route, {
    path: "settings",
    element: /*#__PURE__*/React.createElement(Settings, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: ":dbName",
    element: /*#__PURE__*/React.createElement(Database, null)
  }, /*#__PURE__*/React.createElement(Route, {
    path: ":tableName",
    element: /*#__PURE__*/React.createElement(Table, null)
  }, /*#__PURE__*/React.createElement(Route, {
    path: ":action",
    element: /*#__PURE__*/React.createElement(Action, null)
  })))));
}