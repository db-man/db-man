/* eslint-disable react/prop-types */

import { Table } from 'antd';
import React, { useContext } from 'react';
import PageContext from '../contexts/page';

const columns = [{
  key: 'id',
  dataIndex: 'id',
  title: 'ID',
}, {
  key: 'name',
  dataIndex: 'name',
  title: 'Name',
}, {
  key: 'type',
  dataIndex: 'type',
  title: 'Type',
}, {
  key: 'placeholder',
  dataIndex: 'placeholder',
  title: 'placeholder',
}, {
  key: 'primary',
  dataIndex: 'primary',
  title: 'primary',
  render: (cell) => (cell === true ? 'Yes' : 'No'),
}, {
  key: 'enum',
  dataIndex: 'enum',
  title: 'enum',
  render: (cell) => {
    if (!cell) return 'None';
    return (cell).join(', ');
  },
}, {
  key: 'type:createUpdatePage',
  dataIndex: 'type:createUpdatePage',
  title: 'type:createUpdatePage',
  // render: (cell) => (cell === true ? 'Yes' : 'No'),
}];

export default function TableConfigPage() {
  const page = useContext(PageContext);
  console.debug('TableConfigPage', page.columns); // eslint-disable-line no-console
  return (
    <div className="table-config-page">
      <Table
        rowKey="id"
        dataSource={page.columns}
        columns={columns}
        pagination={false}
      />
      <div><a href={`https://github.com/${localStorage.getItem('dm_github_owner')}/${localStorage.getItem('dm_github_repo_name')}/blob/main/${localStorage.getItem('dm_github_repo_path')}/${page.dbName}/columns.json`} target="_blank" rel="noreferrer">columns.json</a></div>
    </div>
  );
}
