/* eslint-disable react/prop-types */
import React from 'react';
import RandomPageBody from './RandomPageBody';
export default function RandomPage(props) {
  const {
    dbName,
    tableName
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    className: "random-page"
  }, /*#__PURE__*/React.createElement(RandomPageBody, {
    dbName: dbName,
    tableName: tableName
  }));
}