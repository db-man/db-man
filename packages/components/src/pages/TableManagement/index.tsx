import { useParams } from 'react-router-dom';

import TableManagementContainer from './TableManagementContainer';

/**
 * URL: /_management/iam/users
 */
const CreateTablePage = () => {
  const params = useParams();

  if (!params.dbName) {
    return (
      <div>
        db name is required, e.g. <code>/_management/iam/users</code>
      </div>
    );
  }

  if (!params.tableName) {
    return (
      <div>
        table name is required, e.g. <code>/_management/iam/users</code>
      </div>
    );
  }

  return (
    <div className="dbm-table-schema-management-page">
      <TableManagementContainer
        dbName={params.dbName}
        tableName={params.tableName}
      />
    </div>
  );
};

export default CreateTablePage;
