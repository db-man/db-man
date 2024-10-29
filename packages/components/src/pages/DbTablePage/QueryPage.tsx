import React, { useContext, useEffect } from 'react';

import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { darkTheme } from '@uiw/react-json-view/dark';
import { Row, Col, Typography } from 'antd';

import { RowType } from '../../types/Data';
import { LS_IS_DARK_THEME } from '../../constants';
import PageContext from '../../contexts/page';
import ReactSimpleCodeEditor from '../../components/ReactSimpleCodeEditor';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

const defaultCode = 'return rows.slice(0, 10);';

export default function QueryPage() {
  const { dbName, tableName, githubDb } = useContext(PageContext);
  const [code, setCode] = React.useState(defaultCode);
  const [result, setResult] = React.useState({ obj: '', err: '' });
  const [content, setContent] = React.useState<RowType>([]);

  useEffect(() => {
    githubDb?.getTableRows(dbName, tableName).then((response) => {
      setContent(response.content);
    });
  }, []);

  useEffect(() => {
    try {
      // eslint-disable-next-line no-new-func
      const fn = Function('rows', code);

      const output = fn(content);
      setResult({ obj: JSON.stringify(output), err: '' });
    } catch (err: any) {
      // console.log('[ERROR] Failed to eval function!');

      setResult({ obj: '', err: err.message });
    }
  }, [content, code]);

  return (
    <div className='dbm-query-page'>
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
          {result.obj && (
            <JsonView
              value={JSON.parse(result.obj)}
              collapsed={1}
              style={
                localStorage.getItem(LS_IS_DARK_THEME) === 'true'
                  ? darkTheme
                  : lightTheme
              }
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
