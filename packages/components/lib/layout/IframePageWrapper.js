import React from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from './PageWrapper';

function IframePageWrapper() {
  const {
    dbName,
    tableName,
    action
  } = useParams();
  return /*#__PURE__*/React.createElement(PageWrapper, {
    dbName: dbName,
    tableName: tableName,
    action: action
  });
}

export default IframePageWrapper;