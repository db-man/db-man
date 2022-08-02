import React, { useContext } from 'react';
import PageContext from '../contexts/page';
import UpdatePageBody from './UpdatePageBody';
export default function UpdatePage() {
  const {
    dbName,
    tableName
  } = useContext(PageContext);
  return /*#__PURE__*/React.createElement("div", {
    className: "dm-page"
  }, /*#__PURE__*/React.createElement("h1", null, /*#__PURE__*/React.createElement("a", {
    href: window.location.href
  }, "Update", ' ', dbName, ' ', tableName)), /*#__PURE__*/React.createElement(UpdatePageBody, null));
}