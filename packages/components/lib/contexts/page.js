import React from 'react'; // Store all page info, include db, table, and columns
// Setter: src/App/components/PageWrapper.jsx

const PageContext = /*#__PURE__*/React.createContext({
  dbName: '',
  tableName: '',
  action: '',
  columns: [],
  primaryKey: '',
  tables: []
});
export default PageContext;