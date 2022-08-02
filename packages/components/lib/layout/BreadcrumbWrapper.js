import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
export default function BreadcrumbWrapper(props) {
  const {
    dbName,
    tableName,
    action
  } = props;
  return /*#__PURE__*/React.createElement(Breadcrumb, {
    style: {
      margin: '16px 0'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumb.Item, null, /*#__PURE__*/React.createElement(Link, {
    to: "/"
  }, "Home")), dbName ? /*#__PURE__*/React.createElement(Breadcrumb.Item, null, /*#__PURE__*/React.createElement(Link, {
    to: `/${dbName}`
  }, dbName)) : null, tableName ? /*#__PURE__*/React.createElement(Breadcrumb.Item, null, /*#__PURE__*/React.createElement(Link, {
    to: `/${dbName}/${tableName}`
  }, tableName)) : null, action ? /*#__PURE__*/React.createElement(Breadcrumb.Item, null, action) : null);
}
BreadcrumbWrapper.propTypes = {
  dbName: PropTypes.string,
  tableName: PropTypes.string,
  action: PropTypes.string
};
BreadcrumbWrapper.defaultProps = {
  dbName: '',
  tableName: '',
  action: ''
};