/* eslint-disable react/prop-types */

import React, { useContext } from 'react';
import { Table, Tabs } from 'antd';
import type { TabsProps } from 'antd';

import PageContext from '../contexts/page';
import ReactSimpleCodeEditor from './ReactSimpleCodeEditor';

const columns = [
  {
    key: 'id',
    dataIndex: 'id',
    title: 'ID',
  },
  {
    key: 'name',
    dataIndex: 'name',
    title: 'Name',
  },
  {
    key: 'type',
    dataIndex: 'type',
    title: 'Type',
  },
  {
    key: 'placeholder',
    dataIndex: 'placeholder',
    title: 'placeholder',
  },
  {
    key: 'primary',
    dataIndex: 'primary',
    title: 'primary',
    render: (cell: boolean) => (cell === true ? 'Yes' : 'No'),
  },
  {
    key: 'enum',
    dataIndex: 'enum',
    title: 'enum',
    render: (cell: string[]) => {
      if (!cell) return 'None';
      return cell.join(', ');
    },
  },
  {
    key: 'type:createUpdatePage',
    dataIndex: 'type:createUpdatePage',
    title: 'type:createUpdatePage',
  },
  {
    key: 'type:getPage',
    dataIndex: 'type:getPage',
    title: 'type:getPage',
    render: (cell: object) => {
      if (typeof cell === 'object') return JSON.stringify(cell);
      return cell;
    },
  },
  {
    key: 'isListPageImageViewKey',
    dataIndex: 'isListPageImageViewKey',
    title: 'isListPageImageViewKey',
    render: (cell: boolean) => (cell === true ? 'Yes' : 'No'),
  },
];

const footer = ({ dbName }: { dbName: string }) =>
  function TableFooter() {
    return (
      <div>
        Table column definition:{' '}
        <a
          href={`https://github.com/${localStorage.getItem(
            'dm_github_owner'
          )}/${localStorage.getItem(
            'dm_github_repo_name'
          )}/blob/main/${localStorage.getItem(
            'dm_github_repo_path'
          )}/${dbName}/columns.json`}
          target='_blank'
          rel='noreferrer'
        >
          columns.json
        </a>
      </div>
    );
  };

export default function TableConfigPage() {
  const { dbName, columns: dbTableColumns } = useContext(PageContext);

  const items: TabsProps['items'] = [
    {
      key: 'table',
      label: 'Table',
      children: (
        <div>
          <Table
            rowKey='id'
            dataSource={dbTableColumns}
            columns={columns}
            pagination={false}
            footer={footer({ dbName })}
          />
        </div>
      ),
    },
    {
      key: 'json',
      label: 'JSON',
      children: (
        <ReactSimpleCodeEditor
          value={JSON.stringify(dbTableColumns, null, '  ')}
          onChange={() => {}}
        />
      ),
    },
  ];

  return (
    <div className='table-config-page'>
      <Tabs defaultActiveKey='table' items={items} />
    </div>
  );
}
