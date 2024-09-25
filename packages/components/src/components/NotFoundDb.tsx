import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundDb() {
  return (
    <div>
      db not found <Link to='/settings'>Go to Settings</Link>
    </div>
  );
}

export default NotFoundDb;
