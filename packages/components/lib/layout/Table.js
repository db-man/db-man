import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { ActionList } from './PageWrapper';

function Table() {
  const params = useParams();
  return /*#__PURE__*/React.createElement("div", null, !params.action && /*#__PURE__*/React.createElement(ActionList, {
    dbName: params.dbName,
    tableName: params.tableName
  }), /*#__PURE__*/React.createElement(Outlet, null));
}

export default Table;