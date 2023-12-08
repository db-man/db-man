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
  lg: 4,
  xl: 4,
  xxl: 3,
};
const getAny = (arr: RowType[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = (rows: RowType[]) => {
  const randomItems = [];
  for (let i = 0; i < 8; i += 1) {
    randomItems.push(getAny(rows));
  }
  return randomItems;
};

const RandomPageBody = () => {
  const { githubDb, dbName, tableName, primaryKey, columns } =
    useContext(PageContext);
  const [content, setContent] = useState<RowType[] | null>(null);

  useEffect(() => {
    getDataAsync();
  }, []);

  const getDataAsync = async () => {
    try {
      const contentAndSha = await githubDb!.getTableRows(dbName, tableName);
      setContent(contentAndSha.content);
    } catch (error) {
      console.error(
        'Failed to get JSON file in RandomPageBody component, error:',
        error
      );
    }
  };

  const renderItem = (item: RowType) => {
    const column = columns.find((col) => col.id === primaryKey);
    if (!column) return <div>No primary column found</div>;
    // TODO move `type:randomPage` out of the primary column, it should be in the table level.
    const args = column['type:randomPage'] || '';
    const fn = ddRender.getRender(args) || ((val: any) => val);
    return (
      <List.Item>
        <Card>
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

  const renderList = () => {
    if (!content) return null;

    return (
      <List
        grid={listGrid}
        dataSource={getRandomItems(content)}
        renderItem={renderItem}
      />
    );
  };

  return <div className='random-page-body-component'>{renderList()}</div>;
};

export default RandomPageBody;
