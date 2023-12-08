import React from 'react';
import { useParams } from 'react-router-dom';

import PageWrapper from './PageWrapper';

function IframePageWrapper() {
  const { dbName, tableName, action } = useParams();
  if (!dbName) return <div>db name is required</div>;
  if (!tableName) return <div>table name is required</div>;
  if (!action) return <div>action is required</div>;
  return <PageWrapper dbName={dbName} tableName={tableName} action={action} />;
}

export default IframePageWrapper;
