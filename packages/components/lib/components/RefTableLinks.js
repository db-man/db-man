import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';
import { Link } from 'react-router-dom';
import { dbs } from '../dbs';
import PageContext from '../contexts/page';
import { columnType } from './types';
export default function RefTableLinks({
  value,
  column
}) {
  const {
    dbName
  } = useContext(PageContext); // val can be "123" or ["123", "456"]

  let ids = value;

  if (!Array.isArray(value)) {
    ids = [value];
  }

  const refTablePrimaryKey = dbs[dbName].find(db => db.name === column.referenceTable).columns.find(col => col.primary).id;
  return /*#__PURE__*/React.createElement("span", {
    className: "ref-table"
  }, /*#__PURE__*/React.createElement(List, {
    size: "small",
    dataSource: ids,
    renderItem: id => /*#__PURE__*/React.createElement(List.Item, null, /*#__PURE__*/React.createElement(Link, {
      to: `/${dbName}/${column.referenceTable}/get?${refTablePrimaryKey}=${id}`
    }, id))
  }));
}
RefTableLinks.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  column: columnType.isRequired
};