/* eslint-disable react/prop-types */

import { useContext } from 'react';
import { Table, Tabs, Tooltip } from 'antd';
import type { TableColumnsType, TabsProps } from 'antd';
import { useLocation, Link } from 'react-router-dom';

import ComponentDemoModal from '../../components/ComponentDemoModal';
import DistinctColumn from '../../components/DistinctColumn';
import ExternalLink from '../../components/ExternalLink';
import ReactSimpleCodeEditor from '../../components/ReactSimpleCodeEditor';

import { GetPageUiType, UiType } from '../../types/UiType';
import DbColumn from '../../types/DbColumn';
import PageContext from '../../contexts/page';
import {
  COL_UI_LISTPAGE_RANDOMVIEW,
  COL_UI_PRESETS,
  DB_CFG_FILENAME,
  LS_KEY_GITHUB_OWNER,
  LS_KEY_GITHUB_REPO_NAME,
  LS_KEY_GITHUB_REPO_PATH,
  STRING_ARRAY,
  TYPE_CREATE_UPDATE_PAGE,
  TYPE_GET_PAGE,
  TYPE_LIST_PAGE,
} from '../../constants';
import { checkValidTableColumns } from './helpers';

const genColumn = (
  dbName: string,
  dbTableColumns: DbColumn[]
): TableColumnsType<DbColumn> => [
  {
    key: 'id',
    dataIndex: 'id',
    title: 'id',
    fixed: 'left',
    width: 150,
    render: (cell: string) => {
      // if this column is string_array, then render a link "?distinct=tags"
      if (
        dbTableColumns.find(
          (col) => col.id === cell && col.type === STRING_ARRAY
        )
      ) {
        return (
          <Tooltip
            title={`This column type is STRING_ARRAY, will show all ${cell} distinct count. Click to view.`}
          >
            <Link to={`?distinct=${cell}`}>{cell}</Link>
          </Tooltip>
        );
      }
      return cell;
    },
  },
  {
    key: 'name',
    dataIndex: 'name',
    title: 'name',
    width: 150,
  },
  {
    key: 'type',
    dataIndex: 'type',
    title: 'type',
    width: 150,
  },
  {
    key: 'primary',
    dataIndex: 'primary',
    title: 'primary',
    width: 100,
    render: (cell: boolean) => (cell === true ? 'Yes' : 'No'),
  },
  {
    key: 'description',
    dataIndex: 'description',
    title: 'description',
    width: 200,
  },
  {
    key: 'referenceTable',
    dataIndex: 'referenceTable',
    title: 'referenceTable',
    render: (referenceTableName: string) => {
      if (!referenceTableName) {
        return '';
      }
      return (
        <Link to={`/${dbName}/${referenceTableName}/list`}>
          {referenceTableName}
        </Link>
      );
    },
  },
  {
    key: TYPE_CREATE_UPDATE_PAGE,
    dataIndex: TYPE_CREATE_UPDATE_PAGE,
    title: TYPE_CREATE_UPDATE_PAGE,
    render: (renderArg: UiType) => {
      return !renderArg ? '' : <ComponentDemoModal renderArg={renderArg} />;
    },
  },
  {
    key: TYPE_GET_PAGE,
    dataIndex: TYPE_GET_PAGE,
    title: TYPE_GET_PAGE,
    render: (renderArg: GetPageUiType) => {
      return !renderArg ? '' : <ComponentDemoModal renderArg={renderArg} />;
    },
  },
  {
    key: TYPE_LIST_PAGE,
    dataIndex: TYPE_LIST_PAGE,
    title: TYPE_LIST_PAGE,
    render: (renderArg: UiType) => {
      return !renderArg ? '' : <ComponentDemoModal renderArg={renderArg} />;
    },
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
    key: 'ui:createUpdatePage:placeholder',
    dataIndex: 'ui:createUpdatePage:placeholder',
    title: 'ui:createUpdatePage:placeholder',
  },
  {
    key: COL_UI_PRESETS,
    dataIndex: COL_UI_PRESETS,
    title: COL_UI_PRESETS,
  },
  {
    key: 'ui:listPage:isFilter',
    dataIndex: 'ui:listPage:isFilter',
    title: 'ui:listPage:isFilter',
    width: 170,
    render: (cell: boolean) => (cell === true ? 'Yes' : 'No'),
  },
  {
    key: 'ui:listPage:isImageViewKey',
    dataIndex: 'ui:listPage:isImageViewKey',
    title: 'ui:listPage:isImageViewKey',
    render: (cell: boolean) => (cell === true ? 'Yes' : 'No'),
  },
  {
    key: COL_UI_LISTPAGE_RANDOMVIEW,
    dataIndex: COL_UI_LISTPAGE_RANDOMVIEW,
    title: COL_UI_LISTPAGE_RANDOMVIEW,
    render: (cell: object) => {
      if (typeof cell === 'object') return JSON.stringify(cell);
      return cell;
    },
  },
];

const footer = ({ dbName, tableName }: { dbName: string; tableName: string }) =>
  function TableFooter() {
    return (
      <div>
        Table column definition:{' '}
        <ExternalLink
          href={`https://github.com/${localStorage.getItem(
            LS_KEY_GITHUB_OWNER
          )}/${localStorage.getItem(
            LS_KEY_GITHUB_REPO_NAME
          )}/blob/main/${localStorage.getItem(
            LS_KEY_GITHUB_REPO_PATH
          )}/${dbName}/${DB_CFG_FILENAME}`}
          text={DB_CFG_FILENAME}
        />{' '}
        Manage table schema in{' '}
        <a href={`/_management/${dbName}/${tableName}`}>{tableName}</a>
      </div>
    );
  };

export default function SchemaPage() {
  const {
    dbName,
    tableName,
    columns: dbTableColumns,
  } = useContext(PageContext);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const distinctParam = queryParams.get('distinct');

  const errMsg = checkValidTableColumns(dbTableColumns);

  const items: TabsProps['items'] = [
    {
      key: 'table',
      label: 'Table',
      children: (
        <div>
          {errMsg && <div>{errMsg}</div>}
          <Table
            scroll={{ x: 2300 }}
            rowKey="id"
            dataSource={dbTableColumns}
            columns={genColumn(dbName, dbTableColumns)}
            pagination={false}
            footer={footer({ dbName, tableName })}
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

  if (distinctParam) {
    return (
      <div className="table-schema-page">
        <DistinctColumn columnKey={distinctParam} />
      </div>
    );
  }

  return (
    <div className="table-schema-page">
      Table Schema:
      <Tabs defaultActiveKey="table" items={items} />
    </div>
  );
}
