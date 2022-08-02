import React from 'react';

// Store all page info, include db, table, and columns
// Setter: src/App/components/PageWrapper.jsx
const PageContext = React.createContext({
  dbName: '',
  tableName: '',
  action: '',
  columns: [],
  primaryKey: '',
  tables: [],
});

export default PageContext;
