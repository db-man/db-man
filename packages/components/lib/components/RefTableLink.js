import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { utils } from 'db-man';
import { columnType, tableType } from './types';

function RefTableLink({
  dbName,
  tables,
  value,
  column
}) {
  const {
    referenceTable
  } = column;

  if (!referenceTable) {
    return null;
  }

  const referenceTablePrimaryKey = utils.getTablePrimaryKey(tables, referenceTable); // TODO check existing, when exists then no Create button

  return /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Link, {
    to: `/${dbName}/${referenceTable}/create?${referenceTablePrimaryKey}=${value}`
  }, "Create"), ' ', "|", ' ', /*#__PURE__*/React.createElement(Link, {
    to: `/${dbName}/${referenceTable}/update?${referenceTablePrimaryKey}=${value}`
  }, "Update"), "|", ' ', /*#__PURE__*/React.createElement(Link, {
    to: `/${dbName}/${referenceTable}/get?${referenceTablePrimaryKey}=${value}`
  }, "Get"));
}

export default RefTableLink;
RefTableLink.propTypes = {
  dbName: PropTypes.string.isRequired,
  tables: PropTypes.arrayOf(tableType).isRequired,
  column: columnType.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
};
RefTableLink.defaultProps = {
  value: null
};