import { Link } from 'react-router-dom';

export default function ActionList({
  dbName,
  tableName,
}: {
  dbName: string;
  tableName: string;
}) {
  return (
    <div>
      List of actions in table:
      {['list', 'create'].map((action) => (
        <li key={action}>
          <Link to={`/${dbName}/${tableName}/${action}`}>{action}</Link>
        </li>
      ))}
    </div>
  );
}
