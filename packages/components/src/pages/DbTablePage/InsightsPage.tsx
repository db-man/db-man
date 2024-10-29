import React, { useContext, useEffect } from 'react';

import { Typography } from 'antd';
import { Line } from '@ant-design/plots';
import { insightsUtils } from '@db-man/github';

import PageContext from '../../contexts/page';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

export default function InsightsPage() {
  const { dbName, tableName, githubDb } = useContext(PageContext);
  const [content, setContent] = React.useState<string[]>([]);
  const [errMsg, setErrMsg] = React.useState<string>('');

  useEffect(() => {
    githubDb
      ?.getTableInsights(dbName, tableName)
      .then((response) => {
        let tmp = insightsUtils.parseGitCommitDataToCSV(response);
        tmp = insightsUtils.calcTotalLinesByDateFromGitLogs(tmp);
        setContent(tmp);
      })
      .catch((err) => {
        console.error('getTableInsights, error:', err);
        setErrMsg(
          'Failed to get insights from server! Details: ' + err.message
        );
      });
  }, [githubDb, dbName, tableName]);

  console.debug('content', content);

  const insightsData = content
    .slice(1)
    .reverse()
    .map((line) => ({
      date: line.split(',')[0],
      line: Number(line.split(',')[1]),
    }));

  console.debug('insightsData', insightsData);

  const config = {
    data: insightsData,
    xField: 'date',
    yField: 'line',
  };

  return (
    <div className='dbm-insights-page'>
      {errMsg && <Text type='danger'>{errMsg}</Text>}
      <Line {...config} />
    </div>
  );
}
