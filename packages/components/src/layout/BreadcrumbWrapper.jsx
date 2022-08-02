import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';

export default function BreadcrumbWrapper(props) {
  const { dbName, tableName, action } = props;
  return (
    <Breadcrumb style={{ margin: '16px 0' }}>
      <Breadcrumb.Item>
        <Link to="/">Home</Link>
      </Breadcrumb.Item>
      {dbName ? (
        <Breadcrumb.Item>
          <Link to={`/${dbName}`}>{dbName}</Link>
        </Breadcrumb.Item>
      ) : null}
      {tableName ? (
        <Breadcrumb.Item>
          <Link to={`/${dbName}/${tableName}`}>{tableName}</Link>
        </Breadcrumb.Item>
      ) : null}
      {action ? <Breadcrumb.Item>{action}</Breadcrumb.Item> : null}
    </Breadcrumb>
  );
}

BreadcrumbWrapper.propTypes = {
  dbName: PropTypes.string,
  tableName: PropTypes.string,
  action: PropTypes.string,
};
BreadcrumbWrapper.defaultProps = {
  dbName: '',
  tableName: '',
  action: '',
};
