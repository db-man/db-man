import React from 'react';
import App from '../layout/App';
import DbConnectionsExample from './DbConnectionsExample';

import './index.css';

export default function Example() {
  const urlParams = new URLSearchParams(window.location.search);
  const example: string = urlParams.get('example') || '';
  const mmap: Record<string, any> = {
    app: App,
    dbconnections: DbConnectionsExample,
  };
  const Comp = mmap[example];
  if (!Comp) {
    return <App />;
  }
  return <Comp />;
}
