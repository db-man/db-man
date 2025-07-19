import React from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';

import { useAppContext } from '../../contexts/AppContext';
import NotFound from '../../components/NotFound';

function Database() {
  const params = useParams();
  const { dbs, getTablesByDbName } = useAppContext();

  if (!dbs) return <div>Failed to get dbs from localStorage</div>;
  if (!params.dbName) return <div>db name is required</div>;

  const { dbName, tableName } = params;

  const selectedDb = dbs[dbName];
  if (!selectedDb) {
    // Normally this is because we dont have db schema in localStorage
    return <NotFound name='db' />;
  }

  const renderTableList = () => {
    if (!dbs) return null;
    const tablesOfSelectedDb = getTablesByDbName(dbName);
    return (
      <div>
        {tablesOfSelectedDb.map(({ name: tName }) => (
          <li key={tName}>
            <Link to={`/${dbName}/${tName}`}>{tName}</Link>
          </li>
        ))}
      </div>
    );
  };

  return (
    <div>
      {!tableName && (
        <div>
          List of tables in DB:
          {renderTableList()}
        </div>
      )}
      <Outlet />
    </div>
  );
}

export default Database;
