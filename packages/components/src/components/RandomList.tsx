/* eslint-disable react/destructuring-assignment, no-console, max-len */

import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Card } from 'antd';

// import { contexts as PageContext, ddRender } from '@db-man/components';
import PageContext from '../contexts/page';
import * as ddRender from '../ddRender/ddRender';
import { RowType } from '../types/Data';

const listGrid = {
  gutter: 16,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 4, // ≥992px column of grid
  xl: 4, // ≥1200px column of grid
  xxl: 4, // ≥1600px column of grid
};
const defaultPageSize = 8;
const getAny = (arr: RowType[]) => arr[Math.floor(Math.random() * arr.length)];
export const getRandomItems = (rows: RowType[]) => {
  const randomItems = [];
  const numberOfItems = Math.min(defaultPageSize, rows.length);
  for (let i = 0; i < numberOfItems; i += 1) {
    randomItems.push(getAny(rows));
  }
  return randomItems;
};

export default function RandomList({ rows }: { rows: RowType[] }) {
  const { dbName, tableName, primaryKey, columns } = useContext(PageContext);

  // idx only used to force reload page data
  const [idx, setIdx] = useState(0);

  // Press `r` to reload page data
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'r') {
        // idx only used to force rerender this component
        setIdx(idx + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [idx]);

  // idx only used to force reload page data

  const renderItem = (item: RowType) => {
    const column = columns.find((col) => col.id === primaryKey);
    if (!column) return <div>No primary column found</div>;
    // TODO move `type:randomPage` out of the primary column, it should be in the table level.
    const args = column['type:randomPage'] || '';
    const fn = ddRender.getRender(args) || ((val: any) => val);
    return (
      <List.Item>
        <Card>
          <div>{item[primaryKey]}</div>
          <div>{fn(item[primaryKey], item, 0)}</div>
          <Link
            to={{
              pathname: `/${dbName}/${tableName}/update`,
              search: `?${primaryKey}=${item[primaryKey]}`,
            }}
          >
            Update
          </Link>
        </Card>
      </List.Item>
    );
  };

  if (!rows) return null;

  return (
    <List
      grid={listGrid}
      dataSource={getRandomItems(rows)}
      renderItem={renderItem}
    />
  );
}
