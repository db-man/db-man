import { useParams } from 'react-router-dom';

import CreateTableForm from './CreateTableForm';

const CreateTablePage = () => {
  const params = useParams();

  if (!params.dbName)
    return (
      <div>
        db name is required, e.g. <code>/_management/iam/create</code>
      </div>
    );

  return (
    <div className="dbm-create-table-page">
      <CreateTableForm dbName={params.dbName} />
    </div>
  );
};

export default CreateTablePage;
