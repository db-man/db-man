import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { columnType, tableType } from './types';
import { getTablePrimaryKey } from '../utils';
import DbTable from '../types/DbTable';
import DbColumn from '../types/DbColumn';

function RefTableLink({
  dbName,
  tables,
  value,
  column,
}: {
  dbName: string;
  tables: DbTable[];
  value: string | string[] | null;
  column: DbColumn;
}) {
  const { referenceTable } = column;
  if (!referenceTable) {
    return null;
  }

  const referenceTablePrimaryKey = getTablePrimaryKey(tables, referenceTable);
  // TODO check existing, when exists then no Create button
  return (
    <span>
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
      </Link>
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

RefTableLink.defaultProps = {
  value: null,
};
