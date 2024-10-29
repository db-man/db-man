import React from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';

function Table() {
  const params = useParams();
  if (!params.dbName) return <div>db name is required</div>;
  if (!params.tableName) return <div>table name is required</div>;
  return (
    <div>
      {!params.action && (
        <div>
          List of actions in table:
          {['list', 'create'].map((action) => (
            <li key={action}>
              <Link to={`/${params.dbName}/${params.tableName}/${action}`}>
                {action}
              </Link>
            </li>
          ))}
        </div>
      )}
      <Outlet />
    </div>
  );
}

export default Table;
