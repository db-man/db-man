import { Link } from 'react-router-dom';

import { useAppContext } from '../contexts/AppContext';

export default function TableList({ dbName }: { dbName: string }) {
  const { dbs, getTablesByDbName } = useAppContext();
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
}
