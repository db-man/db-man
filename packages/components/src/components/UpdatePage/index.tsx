import React, { useContext, useEffect, useState } from 'react';
import { message, Alert, Spin, Skeleton } from 'antd';
import { utils as githubUtils } from '@db-man/github';

import SuccessMessage from '../SuccessMessage';
import * as utils from '../../utils';
import Form from '../Form';
import PageContext from '../../contexts/page';
import { getNewRows } from './helpers';
import { RowType } from '../../types/Data';

const UpdatePage = () => {
  const { primaryKey, appModes, dbName, tableName, githubDb } =
    useContext(PageContext);

  const [errorMessage, setErrorMessage] = useState('');

  // all rows in table data file
  const [tableFileLoading, setTableFileLoading] = useState('');
  const [rows, setRows] = useState<RowType[]>([]);
  const [tableFileSha, setTableFileSha] = useState<string | null>(null);

  const [recordFileLoading, setRecordFileLoading] = useState('');
  const [record, setRecord] = useState<RowType>({});
  const [recordFileSha, setRecordFileSha] = useState<string | null>(null);

  const [loading, setLoading] = useState('');

  useEffect(() => {
    getData();
  }, []);

  /**
   * `updateTableFileAsync`
   *   to update the whole table file, it's too big, and take more time to get the response from server
   * `updateRecordFileAsync`
   *   to only update record file, file is small, so get response quickly,
   *   but backend (github action) need to merge several record files into big table file after this update
   */
  const handleFormSubmit = (formValues: RowType) => {
    if (isSplitTable()) {
      updateRecordFileAsync(formValues);
    } else {
      updateTableFileAsync(formValues);
    }
  };

  const handleDelete = (formValues: RowType) => {
    if (isSplitTable()) {
      deleteRecordFileAsync(formValues);
    } else {
      message.info('Only supported in split-table mode!');
    }
  };

  /**
   * If primary key is "itemId", and this field value is "foo", then return "foo"
   */
  const currentId = () => {
    return utils.getUrlParams()[primaryKey];
  };

  const isSplitTable = () => {
    return appModes.indexOf('split-table') !== -1;
  };

  const getRecord = () => {
    if (isSplitTable()) {
      return record;
    }
    return (
      rows.find((row) => row[primaryKey] === currentId()) || ({} as RowType)
    );
  };

  const tips = () => {
    const tips = [];
    if (tableFileLoading) tips.push(tableFileLoading);
    if (recordFileLoading) tips.push(recordFileLoading);
    return tips;
  };

  const updateTableFileAsync = async (formValues: RowType) => {
    const newRows = getNewRows(formValues, [...rows], primaryKey, currentId());

    setLoading('Updating table file...');
    try {
      const { commit } = await githubDb!.updateTableFile(
        dbName,
        tableName,
        newRows,
        tableFileSha
      );

      message.success(<SuccessMessage url={commit.html_url} />, 10);
    } catch (err) {
      console.error('updateTableFile, err:', err);
      setErrorMessage('Failed to update table file on server!');
    }

    setLoading('');
  };

  const updateRecordFileAsync = async (formValues: RowType) => {
    setLoading('Updating record file...');
    try {
      const record = {
        ...formValues,
        updatedAt: githubUtils.formatDate(new Date()),
      };
      const { commit } = await githubDb!.updateRecordFile(
        dbName,
        tableName,
        primaryKey,
        record,
        recordFileSha
      );

      message.success(<SuccessMessage url={commit.html_url} />, 10);
    } catch (err) {
      console.error('updateRecordFile, err:', err);
      setErrorMessage('Failed to update record file on server!');
    }

    setLoading('');
  };

  const deleteRecordFileAsync = async (formValues: RowType) => {
    setLoading('Deleting record file...');
    try {
      const { commit } = await githubDb!.deleteRecordFile(
        dbName,
        tableName,
        formValues[primaryKey],
        recordFileSha
      );

      message.success(<SuccessMessage url={commit.html_url} />, 10);
    } catch (err) {
      console.error('deleteRecordFile, err:', err);
      setErrorMessage('Failed to delete record file on server!');
    }

    setLoading('');
  };

  // Get single record file or whole table file
  const getData = () => {
    const ps = [];
    if (isSplitTable()) {
      // When in split-table mode, whole table file is too big to download and cost a lot of time to download
      ps.push(getRecordFileAsync());
    } else {
      ps.push(getTableFileAsync());
    }
    Promise.all(ps);
  };

  const getTableFileAsync = async () => {
    setTableFileLoading(`Loading ${dbName}/${tableName} ...`);
    try {
      const { content: rows, sha: tableFileSha } = await githubDb!.getTableRows(
        dbName,
        tableName
      );
      setRows(rows);
      setTableFileSha(tableFileSha);
    } catch (err) {
      console.error('getTableRows, error:', err);
      setErrorMessage('Failed to get table file from server!');
    }
    setTableFileLoading('');
  };

  const getRecordFileAsync = async () => {
    setRecordFileLoading(`Loading ${dbName}/${tableName}/${currentId()}`);
    try {
      const { content, sha } = await githubDb!.getRecordFileContentAndSha(
        dbName,
        tableName,
        currentId()
      );
      setRecordFileSha(sha);
      setRecord(content);
    } catch (err) {
      console.error('getRecordFileContentAndSha, error:', err);
      setErrorMessage('Failed to get file from server!');
    }
    setRecordFileLoading('');
  };

  const renderAlert = () => {
    if (!errorMessage) {
      return null;
    }
    return <Alert message={errorMessage} type='error' />;
  };

  const renderForm = () => {
    if (tips().length) {
      return <Spin tip={tips().join(',')}>Loading...</Spin>;
    }
    if (!getRecord()[primaryKey]) {
      return null;
    }
    return (
      <Form
        defaultValues={getRecord()}
        rows={rows}
        loading={!!loading}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <div className='dm-page update-page-body-component'>
      <Skeleton loading={tips().length > 0}>
        {renderAlert()}
        {renderForm()}
      </Skeleton>
    </div>
  );
};

export default UpdatePage;
