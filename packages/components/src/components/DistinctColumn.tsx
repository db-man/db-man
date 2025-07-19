/* eslint-disable react/destructuring-assignment, no-console, max-len */

import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { List } from 'antd';

import PageContext from '../contexts/page';
import { RowType } from '../types/Data';

const DistinctColumn = ({ columnKey }: { columnKey: string }) => {
  const { githubDb, dbName, tableName } = useContext(PageContext);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<RowType>([]);

  useEffect(() => {
    getDataAsync();
  }, []);

  const getDataAsync = async () => {
    try {
      setLoading(true);
      const contentAndSha = await githubDb!.getTableRows(dbName, tableName);
      setLoading(false);
      setContent(contentAndSha.content);
    } catch (error) {
      setLoading(false);
      console.error(
        'Failed to get JSON file in DistinctColumn component, error:',
        error
      );
    }
  };

  const renderList = () => {
    if (!content) return null;

    // tag name <=> tag count
    const tagNameCount: {
      [key: string]: number;
    } = {};
    content.forEach((item: RowType) => {
      if (!item[columnKey]) return;
      item[columnKey].forEach((name: string) => {
        if (!tagNameCount[name]) {
          tagNameCount[name] = 0;
        }
        tagNameCount[name] += 1;
      });
    });

    const dataSource = Object.keys(tagNameCount)
      .map((name) => ({
        name,
        count: tagNameCount[name],
      }))
      .sort((a, b) => b.count - a.count);

    return (
      <List
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 4,
          lg: 4,
          xl: 8,
          xxl: 3,
        }}
        dataSource={dataSource}
        renderItem={(item) => {
          const filter = encodeURIComponent(
            JSON.stringify({
              [columnKey]: item.name,
            })
          );
          return (
            <List.Item>
              <Link
                to={{
                  pathname: `/${dbName}/${tableName}/list`,
                  search: `?filter=${filter}`,
                }}
              >
                {item.name}
              </Link>{' '}
              : {item.count}
            </List.Item>
          );
        }}
      />
    );
  };

  return <div className='dbm-distinct-column-component'>{renderList()}</div>;
};

export default DistinctColumn;
