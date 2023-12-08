import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { TableList } from './PageWrapper';
import { useAppContext } from '../contexts/AppContext';

function Database() {
  const params = useParams();
  const { dbs } = useAppContext();

  if (!dbs) return <div>Failed to get dbs from localStorage</div>;
  if (!params.dbName) return <div>db name is required</div>;

  const selectedDb = dbs[params.dbName];
  if (!selectedDb) return <div>db not found</div>;

  return (
    <div>
      {!params.tableName && (
        <div>
          List of tables in DB:
          <TableList dbName={params.dbName} />
        </div>
      )}
      <Outlet />
    </div>
  );
}

export default Database;
