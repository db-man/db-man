function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { dbs } from '../dbs';

const withRouter = Component => {
  function Wrapper(props) {
    const params = useParams(); // eslint-disable-next-line react/jsx-props-no-spreading

    return /*#__PURE__*/React.createElement(Component, _extends({
      params: params
    }, props));
  }

  return Wrapper;
};

function PageHeaderContent(props) {
  const {
    params
  } = props;

  if (!dbs) {
    return null;
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "page-header"
  }, /*#__PURE__*/React.createElement("div", {
    key: "logo",
    className: "logo"
  }), /*#__PURE__*/React.createElement(Menu, {
    key: "menu",
    theme: "dark",
    mode: "horizontal",
    defaultSelectedKeys: ['home'],
    selectedKeys: [params.dbName],
    items: [{
      key: 'home',
      label: /*#__PURE__*/React.createElement(Link, {
        to: "/"
      }, "Home")
    }, ...Object.keys(dbs || {}).map(dbName => ({
      key: dbName,
      label: /*#__PURE__*/React.createElement(Link, {
        to: `/${dbName}`
      }, dbName)
    })), {
      key: 'settings',
      label: /*#__PURE__*/React.createElement(Link, {
        to: "/settings"
      }, "Settings")
    }]
  }));
}

PageHeaderContent.propTypes = {
  params: PropTypes.shape({
    dbName: PropTypes.string
  })
};
PageHeaderContent.defaultProps = {
  params: {}
};
export default withRouter(PageHeaderContent);