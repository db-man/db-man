/* eslint-disable react/prop-types */

import React, { useContext } from 'react';
import { Table, Tabs } from 'antd';
import type { TabsProps } from 'antd';

import PageContext from '../contexts/page';
import ReactSimpleCodeEditor from './ReactSimpleCodeEditor';
import { DB_CFG_FILENAME } from '../constants';
import DbColumn, {
  TABLE_COLUMN_KEYS,
  TableColumnKeyType,
} from '../types/DbColumn';

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
    key: 'ui:listPage:isFilter',
    dataIndex: 'ui:listPage:isFilter',
    title: 'ui:listPage:isFilter',
    render: (cell: boolean) => (cell === true ? 'Yes' : 'No'),
  },
  {
    key: 'ui:createUpdatePage:enum',
    dataIndex: 'ui:createUpdatePage:enum',
    title: 'ui:createUpdatePage:enum',
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
    key: 'ui:listPage:randomView',
    dataIndex: 'ui:listPage:randomView',
    title: 'ui:listPage:randomView',
    render: (cell: object) => {
      if (typeof cell === 'object') return JSON.stringify(cell);
      return cell;
    },
  },
  {
    key: 'ui:listPage:isImageViewKey',
    dataIndex: 'ui:listPage:isImageViewKey',
    title: 'ui:listPage:isImageViewKey',
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
          )}/${dbName}/${DB_CFG_FILENAME}`}
          target='_blank'
          rel='noreferrer'
        >
          {DB_CFG_FILENAME}
        </a>
      </div>
    );
  };

const checkValidTableColumns = (dbTableColumns: DbColumn[]) => {
  let msg = '';
  if (dbTableColumns.length === 0) {
    msg += 'No columns defined in the table. ';
  }
  dbTableColumns.forEach((col) => {
    // check every properties of col, should in this list TABLE_COLUMN_KEYS
    Object.keys(col).forEach((key) => {
      if (TABLE_COLUMN_KEYS.indexOf(key as TableColumnKeyType) < 0) {
        msg += `Invalid key: ${key} in column: ${col.id}. `;
      }
    });
  });
  return msg;
};

export default function TableConfigPage() {
  const { dbName, columns: dbTableColumns } = useContext(PageContext);

  const errMsg = checkValidTableColumns(dbTableColumns);

  const items: TabsProps['items'] = [
    {
      key: 'table',
      label: 'Table',
      children: (
        <div>
          {errMsg && <div>{errMsg}</div>}
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
