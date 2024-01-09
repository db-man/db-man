import { Row, Col } from 'antd';
import React, { useContext, useEffect } from 'react';
import JsonView from '@uiw/react-json-view';

import PageContext from '../contexts/page';
import ReactSimpleCodeEditor from './ReactSimpleCodeEditor';
import { RowType } from '../types/Data';

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
    <div className='dm-query-page'>
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
          <div>Error:</div>
          <div style={{ color: 'red' }}>{result.err}</div>
          <div>Result:</div>
          {result.obj && (
            <JsonView value={JSON.parse(result.obj)} collapsed={1} />
          )}
        </Col>
      </Row>
    </div>
  );
}
