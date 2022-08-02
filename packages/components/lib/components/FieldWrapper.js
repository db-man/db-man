import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { dbs } from '../dbs';
import RefTableLink from './RefTableLink';
import PageContext from '../contexts/page';
import { columnType } from './types';
import * as constants from '../constants'; // TODO When value is an array, how to render RefTableLink

export default function FieldWrapper(props) {
  const {
    dbName
  } = useContext(PageContext);
  const {
    column,
    value,
    children
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    key: column.id,
    className: "dm-form-field dm-string-form-field",
    "data-debug": JSON.stringify(column)
  }, /*#__PURE__*/React.createElement("div", {
    className: "dm-field-label"
  }, /*#__PURE__*/React.createElement("b", null, column.name, column.type === constants.STRING_ARRAY ? ` (count:${value ? value.length : 0})` : null), ":", ' ', column.referenceTable && typeof value === 'string' && /*#__PURE__*/React.createElement(RefTableLink, {
    dbName: dbName,
    tables: dbs[dbName],
    value: value,
    column: column
  })), children);
}
FieldWrapper.propTypes = {
  column: columnType.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.bool, PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  children: PropTypes.node
};
FieldWrapper.defaultProps = {
  value: '',
  children: null
}; // FieldWrapper.contextType = PageContext;