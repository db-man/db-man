import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';
import { Link } from 'react-router-dom';

import PageContext from '../contexts/page';
import { columnType } from './types';
import { useAppContext } from '../contexts/AppContext';
import DbColumn from '../types/DbColumn';

export default function RefTableLinks({
  value,
  column,
}: {
  value: string | string[] | null;
  column: DbColumn;
}) {
  const { dbs } = useAppContext();
  const { dbName } = useContext(PageContext);
  // val can be "123" or ["123", "456"]
  let ids = [];
  if (Array.isArray(value)) {
    ids = value;
  } else {
    ids = value === null ? [] : [value];
  }
  const foundRefTable = dbs[dbName].find(
    (tb) => tb.name === column.referenceTable
  );
  if (!foundRefTable) {
    return <div>Ref table not found</div>;
  }
  const foundRefTableColumn = foundRefTable.columns.find((col) => col.primary);
  if (!foundRefTableColumn) {
    return <div>Ref table primary column not found</div>;
  }
  const refTablePrimaryKey = foundRefTableColumn.id;
  return (
    <span className='ref-table'>
      <List
        size='small'
        dataSource={ids}
        renderItem={(id) => (
          <List.Item>
            <Link
              to={`/${dbName}/${column.referenceTable}/get?${refTablePrimaryKey}=${id}`}
            >
              {id}
            </Link>
          </List.Item>
        )}
      />
    </span>
  );
}

RefTableLinks.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  column: columnType.isRequired,
};
