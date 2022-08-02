import React from 'react';
import { useParams } from 'react-router-dom';

import PageWrapper from './PageWrapper';

function Action() {
  const params = useParams();
  return (
    <PageWrapper
      dbName={params.dbName}
      tableName={params.tableName}
      action={params.action}
    />
  );
}

export default Action;
