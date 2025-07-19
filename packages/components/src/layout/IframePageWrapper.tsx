import { useParams } from 'react-router-dom';

import DbTablePage from '../pages/DbTablePage/DbTablePage';
import { useAppContext } from '../contexts/AppContext';
import NotFound from '../components/NotFound';

function IframePageWrapper() {
  const { dbName, tableName, action } = useParams();
  const { dbs } = useAppContext();

  if (!dbName) return <div>db name is required</div>;
  if (!tableName) return <div>table name is required</div>;
  if (!action) return <div>action is required</div>;

  const selectedDb = dbs[dbName];
  if (!selectedDb) {
    // Normally this is because we dont have db schema in localStorage
    return <NotFound name='db' />;
  }

  return <DbTablePage dbName={dbName} tableName={tableName} action={action} />;
}

export default IframePageWrapper;
