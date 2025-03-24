import { useParams } from 'react-router-dom';

import TableManagementForm from './TableManagementForm';

const CreateTablePage = () => {
  const params = useParams();

  if (!params.dbName)
    return (
      <div>
        db name is required, e.g. <code>/_management/iam/create</code>
      </div>
    );

  return (
    <div className="create-table-page">
      <TableManagementForm dbName={params.dbName} />
    </div>
  );
};

export default CreateTablePage;
