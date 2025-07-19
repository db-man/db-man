import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { columnType, tableType } from './types';
import DbTable from '../types/DbTable';
import DbColumn from '../types/DbColumn';
import { getTablePrimaryKey } from '../dbs';

function RefTableLink({
  dbName,
  tables,
  value,
  column,
}: {
  dbName: string;
  tables: DbTable[];
  value?: string;
  column: DbColumn;
}) {
  const { referenceTable } = column;
  if (!referenceTable) {
    return null;
  }

  const referenceTablePrimaryKey = getTablePrimaryKey(tables, referenceTable);
  // TODO check existing, when exists then no Create button
  return (
    <span className='dbm-ref-table-link' data-dbm-component='RefTableLink'>
      <Link
        to={`/${dbName}/${referenceTable}/create?${referenceTablePrimaryKey}=${value}`}
      >
        Create
      </Link>{' '}
      |{' '}
      <Link
        to={`/${dbName}/${referenceTable}/update?${referenceTablePrimaryKey}=${value}`}
      >
        Update
      </Link>{' '}
      |{' '}
      <Link
        to={`/${dbName}/${referenceTable}/get?${referenceTablePrimaryKey}=${value}`}
      >
        Get
      </Link>
    </span>
  );
}

export default RefTableLink;

RefTableLink.propTypes = {
  dbName: PropTypes.string.isRequired,
  tables: PropTypes.arrayOf(tableType).isRequired,
  column: columnType.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};
