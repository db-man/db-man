import React from 'react';
import { useParams } from 'react-router-dom';

import PageWrapper from './PageWrapper';

function Action() {
  const params = useParams();
  if (!params.dbName) return <div>db name is required</div>;
  if (!params.tableName) return <div>table name is required</div>;
  if (!params.action) return <div>action is required</div>;
  return (
    <PageWrapper
      dbName={params.dbName}
      tableName={params.tableName}
      action={params.action}
    />
  );
}

export default Action;
