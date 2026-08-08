import React, { useContext, useEffect, useState } from 'react';

import { Typography, TreeSelect, Table, Collapse, CollapseProps } from 'antd';

import { RowType } from '../../types/Data';
import { useAppContext } from '../../contexts/AppContext';
import CommonPageContext from '../../contexts/commonPage';
import ReactSimpleCodeEditor from '../../components/ReactSimpleCodeEditor';
import { useParams } from 'react-router';
import { LS_QUERY_PAGE_SELECTED_TABLE_NAMES } from '../../constants';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;
const { SHOW_PARENT } = TreeSelect;

/**
 * A virutal view for a db table, can be used to join with other tables to construct a complex query
 */
export default function ViewPage() {
  const { dbs, getTablesByDbName, getViewByDbNameViewName } = useAppContext();
  const { dbName, viewName } = useParams();
  const { githubDb } = useContext(CommonPageContext);
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedDbTableNames, setSelectedDbTableNames] = useState<string[]>(
    JSON.parse(
      localStorage.getItem(LS_QUERY_PAGE_SELECTED_TABLE_NAMES) || '[]',
    ),
  );
  const [code, setCode] = React.useState('');
  const [result, setResult] = React.useState({ obj: [], err: '' });
  // tablesRows={iam:[...], roles:[...]}
  const [tablesRows, setTablesRows] = React.useState<{
    [key: string]: RowType;
  }>({});

  const treeData = Object.keys(dbs || {}).map((dbName) => ({
    title: dbName,
    value: dbName,
    key: dbName,
    children: getTablesByDbName(dbName).map((table) => ({
      title: table.name,
      value: `${dbName}/${table.name}`,
      key: `${dbName}/${table.name}`,
    })),
  }));

  useEffect(() => {
    selectedDbTableNames.forEach((dbTableName) => {
      const [dbName, tableName] = dbTableName.split('/');
      githubDb
        ?.getTableRows(dbName, tableName)
        .then((response: { content: RowType[] }) => {
          setTablesRows((prev) => ({
            ...prev,
            [dbTableName]: response.content,
          }));
        });
    });
  }, [githubDb, selectedDbTableNames]);

  useEffect(() => {
    if (!dbName || !viewName) {
      setPageError('dbName or viewName is missing');
      return;
    }

    const view = getViewByDbNameViewName(dbName || '', viewName || '');
    if (!view) {
      setResult({ obj: [], err: 'View not found' });
      return;
    }
    // TODO: no hard code `query`, should defined in @db-man/github package
    const codeOrFile = view.query || '';
    console.log('codeOrFile:', codeOrFile);

    if (codeOrFile.startsWith('query_file:')) {
      githubDb
        ?.getDbViewScriptFileContentAndSha(
          dbName,
          codeOrFile.replace('query_file:', ''),
        )
        .then((code: string) => {
          console.log('code:', code);
          setCode(code);
        });
    } else {
      setCode(codeOrFile);
    }
  }, [dbName, viewName, getViewByDbNameViewName]);

  useEffect(() => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = Function('tablesRows', code);
      const outputRows = fn(tablesRows);
      setResult({ obj: outputRows, err: '' });
    } catch (err: any) {
      // console.log('[ERROR] Failed to eval function!');

      setResult({ obj: [], err: err.message });
    }
  }, [tablesRows, code]);

  const handleSelectedTableNamesChange = (newValue: string[]) => {
    // newValue=['iam/users', 'iam/roles']
    setSelectedDbTableNames(newValue);
    localStorage.setItem(
      LS_QUERY_PAGE_SELECTED_TABLE_NAMES,
      JSON.stringify(newValue),
    );
  };

  const tProps = {
    treeData,
    value: selectedDbTableNames,
    onChange: handleSelectedTableNamesChange,
    treeCheckable: true,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: 'Please select',
    style: {
      width: '100%',
    },
  };

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: 'View Query Code',
      children: (
        <div>
          <ReactSimpleCodeEditor
            height="50em"
            value={code}
            onChange={setCode}
          />
        </div>
      ),
    },
  ];

  const renderTable = () => {
    if (typeof result.obj !== 'object') {
      return (
        <div>
          Result is not an object, but result content:{' '}
          {JSON.stringify(result.obj)}
        </div>
      );
    }
    return (
      <div>
        {result.obj && result.obj.length > 0 && (
          <Table
            rowKey={(record) => JSON.stringify(record)}
            columns={Object.keys(result.obj[0] || {}).map((key) => ({
              title: key,
              dataIndex: key,
              key,
              // @ts-ignore
              sorter: (a, b) => a[key] - b[key],
            }))}
            dataSource={result.obj}
          />
        )}
      </div>
    );
  };

  return (
    <div className="dbm-view-page">
      {pageError && (
        <div style={{ color: 'red' }}>
          <Text>Error: {pageError}</Text>
        </div>
      )}
      <div>View Name: {viewName}</div>
      <div>
        <div>DB Tables Selector:</div>
        <TreeSelect {...tProps} />
      </div>
      <div>
        <Collapse items={items} defaultActiveKey={['2']} />
      </div>
      <div>
        <div>
          <Text>Error:</Text>
        </div>
        <div style={{ color: 'red' }}>{result.err}</div>
        <div>
          <Text>Result:</Text>
        </div>
        {renderTable()}
      </div>
    </div>
  );
}
