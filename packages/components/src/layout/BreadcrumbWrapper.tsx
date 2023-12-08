import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';

export default function BreadcrumbWrapper(props: {
  dbName: string;
  tableName: string;
  action: string;
}) {
  const { dbName, tableName, action } = props;
  return (
    <Breadcrumb
      style={{ margin: '16px 0' }}
      items={[
        { title: <Link to='/'>Home</Link> },
        {
          title: dbName ? <Link to={`/${dbName}`}>{dbName}</Link> : null,
        },
        {
          title: tableName ? (
            <Link to={`/${dbName}/${tableName}`}>{tableName}</Link>
          ) : null,
        },
        {
          title: action || null,
        },
      ]}
    />
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
