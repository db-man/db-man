/* eslint-disable react/destructuring-assignment, no-console, max-len, react/prop-types */
import React from 'react';
import GetPageBody from './GetPageBody';
export default function GetPage(props) {
  const {
    dbName,
    tableName
  } = props;
  /**
     * When tableName changed, for example A to B, this new props B pass to GetPageBody.
     * It will trigger render() first, then componentDidUpdate() to load data from backend in GetPageBody.
     * So when render() is triggered, in GetPageBody the A table rows data state, will be different than the table schema B.
     * Then it will make a lot of issues when try to render the mismatch data/schema.
     *
     * By using key, when tableName changed, it will re-create the whole GetPageBody component.
     */

  const key = `${dbName}-${tableName}`;
  return /*#__PURE__*/React.createElement("div", {
    className: "dm-page"
  }, /*#__PURE__*/React.createElement("h1", null, "Get", ' ', dbName, ' ', tableName), /*#__PURE__*/React.createElement(GetPageBody, {
    key: key,
    dbName: dbName,
    tableName: tableName,
    tables: props.tables
  }));
}