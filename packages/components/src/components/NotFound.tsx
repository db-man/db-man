import { Link } from 'react-router-dom';

function NotFound({ name }: { name: string }) {
  return (
    <div>
      {name} not found <Link to='/settings'>Go to Settings</Link>
    </div>
  );
}

export default NotFound;
