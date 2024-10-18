import React, { useContext, useEffect } from 'react';

import { Row, Col, Typography, TreeSelect, Table } from 'antd';

import { RowType } from '../../types/Data';
import { useAppContext } from '../../contexts/AppContext';
import CommonPageContext from '../../contexts/commonPage';
import ReactSimpleCodeEditor from '../../components/ReactSimpleCodeEditor';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;
const { SHOW_PARENT } = TreeSelect;

const defaultCode = `
const rolesUserCountRow = tablesRows['iam/roles'].map((role) => {
  const users = tablesRows['iam/users'].filter((user) => user.roleCode === role.code);
  return {
    role_code: role.code,
    user_count: users.length,
  };
});
console.log('rolesUserCountRow:', rolesUserCountRow);
return rolesUserCountRow;
`;

export default function QueryPage() {
  const { dbs, getTablesByDbName } = useAppContext();
  const { githubDb } = useContext(CommonPageContext);
  const [selectedDbTableNames, setSelectedDbTableNames] = React.useState<
    string[]
  >(
    JSON.parse(
      localStorage.getItem('dbm_query_page_selected_table_names') || '[]'
    )
  );
  const [code, setCode] = React.useState(defaultCode);
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
      githubDb?.getTableRows(dbName, tableName).then((response) => {
        setTablesRows((prev) => ({
          ...prev,
          [dbTableName]: response.content,
        }));
      });
    });
  }, [githubDb, selectedDbTableNames]);

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
      'dbm_query_page_selected_table_names',
      JSON.stringify(newValue)
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

  return (
    <div className='dbm-query-page'>
      <div>
        <TreeSelect {...tProps} />
      </div>
      <Row>
        <Col span={16}>
          Code:
          <ReactSimpleCodeEditor
            height='50em'
            value={code}
            onChange={setCode}
          />
          <br />
        </Col>
        <Col span={8}>
          <div>
            <Text>Error:</Text>
          </div>
          <div style={{ color: 'red' }}>{result.err}</div>
          <div>
            <Text>Result:</Text>
          </div>
          <Table
            rowKey={(record) => JSON.stringify(record)}
            columns={Object.keys(result.obj[0] || {}).map((key) => ({
              title: key,
              dataIndex: key,
              key,
            }))}
            dataSource={result.obj}
          />
        </Col>
      </Row>
    </div>
  );
}
