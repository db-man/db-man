import React from 'react';
import { useParams } from 'react-router-dom';

import PageWrapper from './PageWrapper';

function IframePageWrapper() {
  const { dbName, tableName, action } = useParams();
  return <PageWrapper dbName={dbName} tableName={tableName} action={action} />;
}

export default IframePageWrapper;
