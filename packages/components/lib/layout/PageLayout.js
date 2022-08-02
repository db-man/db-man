import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Layout } from 'antd';
import BreadcrumbWrapper from './BreadcrumbWrapper';
import LeftSideMenu from '../components/LeftSideMenu';
import PageHeaderContent from '../components/PageHeaderContent';
const {
  Header,
  Content,
  Sider
} = Layout;
export default function PageLayout() {
  const {
    dbName,
    tableName,
    action
  } = useParams();
  return /*#__PURE__*/React.createElement(Layout, null, /*#__PURE__*/React.createElement(Header, {
    className: "header",
    style: {
      height: '30px',
      lineHeight: '30px'
    }
  }, /*#__PURE__*/React.createElement(PageHeaderContent, null)), /*#__PURE__*/React.createElement(Layout, null, /*#__PURE__*/React.createElement(Sider, {
    width: 300,
    className: "site-layout-background"
  }, dbName ? /*#__PURE__*/React.createElement(LeftSideMenu, {
    dbName: dbName,
    tableName: tableName,
    action: action
  }) : null), /*#__PURE__*/React.createElement(Layout, {
    style: {
      padding: '0 24px 24px'
    }
  }, /*#__PURE__*/React.createElement(BreadcrumbWrapper, {
    dbName: dbName,
    tableName: tableName,
    action: action
  }), /*#__PURE__*/React.createElement(Content, {
    className: "site-layout-background",
    style: {
      // padding: 24,
      margin: 0,
      minHeight: 280
    }
  }, /*#__PURE__*/React.createElement(Outlet, null)))));
}