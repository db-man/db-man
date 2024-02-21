/* eslint-disable react/destructuring-assignment, no-console, max-len */

import React, { useCallback, useContext, useEffect, useState } from 'react';

// import { contexts as PageContext, ddRender } from '@db-man/components';
import PageContext from '../contexts/page';
import { RowType } from '../types/Data';
import RandomList from './RandomList';

export default function RandomPage() {
  const { githubDb, dbName, tableName } = useContext(PageContext);
  const [content, setContent] = useState<RowType[] | null>(null);

  const getDataAsync = useCallback(async () => {
    try {
      const contentAndSha = await githubDb!.getTableRows(dbName, tableName);
      setContent(contentAndSha.content);
    } catch (error) {
      console.error(
        'Failed to get JSON file in RandomPage component, error:',
        error
      );
    }
  }, [githubDb, dbName, tableName]);

  useEffect(() => {
    getDataAsync();
  }, [getDataAsync]);

  return (
    <div className='random-page'>
      <div className='random-page-body-component'>
        <RandomList rows={content || []} />
      </div>
    </div>
  );
}
