import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as constants from '../constants';
import Settings from '../pages/Settings';
import AppLayout from './AppLayout';
export default function App() {
  const dbs = JSON.parse(localStorage.getItem(constants.LS_KEY_DBS_SCHEMA));
  if (!dbs) return /*#__PURE__*/React.createElement(Settings, null);
  return /*#__PURE__*/React.createElement(BrowserRouter, null, /*#__PURE__*/React.createElement(AppLayout, null));
}