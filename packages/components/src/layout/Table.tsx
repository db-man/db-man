import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { ActionList } from './PageWrapper';

function Table() {
  const params = useParams();
  if (!params.dbName) return <div>db name is required</div>;
  if (!params.tableName) return <div>table name is required</div>;
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
