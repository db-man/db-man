import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

import TableList from '../components/TableList';
import { useAppContext } from '../contexts/AppContext';
import NotFound from '../components/NotFound';

function Database() {
  const params = useParams();
  const { dbs } = useAppContext();

  if (!dbs) return <div>Failed to get dbs from localStorage</div>;
  if (!params.dbName) return <div>db name is required</div>;

  const selectedDb = dbs[params.dbName];
  if (!selectedDb) {
    // Normally this is because we dont have db schema in localStorage
    return <NotFound name='db' />;
  }

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
