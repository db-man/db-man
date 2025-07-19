import React, { useContext, useEffect } from 'react';

import { insightsUtils } from '@db-man/github';
import { Typography } from 'antd';

import PageContext from '../../contexts/page';

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

  const maxLine = Math.max(...insightsData.map(d => d.line));
  const svgHeight = 300;
  const svgWidth = 1200;
  const padding = 50;

  const points = insightsData.map((d, i) => {
    const x = padding + (i * (svgWidth - 2 * padding)) / (insightsData.length - 1);
    const y = svgHeight - padding - (d.line * (svgHeight - 2 * padding)) / maxLine;
    return `${x},${y}`;
  }).join(' ');

  // Determine the interval for displaying X-axis labels
  const labelInterval = Math.ceil(insightsData.length / 10);

  return (
    <div className='dbm-insights-page'>
      {errMsg && <Text type='danger'>{errMsg}</Text>}
      <svg width={svgWidth} height={svgHeight}>
        {/* X-axis */}
        <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="black" />
        {/* Y-axis */}
        <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} stroke="black" />
        {/* Line chart */}
        <polyline fill="none" stroke="steelblue" strokeWidth="2" points={points} />
        {/* X-axis labels */}
        {insightsData.map((d, i) => {
          if (i % labelInterval === 0) {
            const x = padding + (i * (svgWidth - 2 * padding)) / (insightsData.length - 1);
            return (
              <text
                key={i}
                x={x}
                y={svgHeight - padding + 20}
                textAnchor="middle"
                fontSize="10"
                transform={`rotate(45, ${x}, ${svgHeight - padding + 20})`}
              >
                {d.date}
              </text>
            );
          }
          return null;
        })}
        {/* Y-axis labels */}
        {[0, maxLine / 2, maxLine].map((d, i) => {
          const y = svgHeight - padding - (d * (svgHeight - 2 * padding)) / maxLine;
          return <text key={i} x={padding - 10} y={y} textAnchor="end" fontSize="10">{Math.round(d)}</text>;
        })}
      </svg>
    </div>
  );
}