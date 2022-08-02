import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { ActionList } from './PageWrapper';

function Table() {
  const params = useParams();
  return (
    <div>
      {!params.action && (
        <ActionList dbName={params.dbName} tableName={params.tableName} />
      )}
      <Outlet />
    </div>
  );
}

export default Table;
