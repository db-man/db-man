import React, { useContext, useEffect, useState } from 'react';

import { utils as githubUtils, types } from '@db-man/github';
import { message, Alert, Spin, Skeleton } from 'antd';

import SharedErrorAlert from '../../../components/SharedErrorAlert';
import CommitSuccessMessage from '../../../components/CommitSuccessMessage';
import * as utils from '../../../utils';
import { buildErrorMessage } from '../../../utils/errorMessage';
import Form from '../../../components/Form';
import PageContext from '../../../contexts/page';
import { getNewRows } from './helpers';
import { RowType } from '../../../types/Data';

const UpdatePage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { primaryKey, appModes, dbName, tableName, githubDb } =
    useContext(PageContext);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<React.ReactNode | null>(
    null,
  );

  // all rows in table data file
  const [tableFileLoading, setTableFileLoading] = useState('');
  const [rows, setRows] = useState<RowType[]>([]);
  const [tableFileSha, setTableFileSha] =
    useState<types.UpdateFileType['sha']>(undefined);

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
      messageApi.info('Only supported in split-table mode!');
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
        tableFileSha,
      );

      setSuccessMessage(
        <CommitSuccessMessage message="Record saved." url={commit.html_url} />,
      );
    } catch (err) {
      console.error('updateTableFile, err:', err);
      setErrorMessage(
        buildErrorMessage('Failed to update table file on server!', err),
      );
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
        recordFileSha,
      );

      setSuccessMessage(
        <CommitSuccessMessage message="Record saved." url={commit.html_url} />,
      );
    } catch (err) {
      console.error('updateRecordFile, err:', err);
      setErrorMessage(
        buildErrorMessage('Failed to update record file on server!', err),
      );
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
        recordFileSha,
      );

      setSuccessMessage(
        <CommitSuccessMessage
          message="Record deleted."
          url={commit.html_url}
        />,
      );
    } catch (err) {
      console.error('deleteRecordFile, err:', err);
      setErrorMessage(
        buildErrorMessage('Failed to delete record file on server!', err),
      );
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
        tableName,
      );
      setRows(rows);
      setTableFileSha(tableFileSha);
    } catch (err) {
      console.error('getTableRows, error:', err);
      setErrorMessage(
        buildErrorMessage('Failed to get table file from server!', err),
      );
    }
    setTableFileLoading('');
  };

  const getRecordFileAsync = async () => {
    setRecordFileLoading(`Loading ${dbName}/${tableName}/${currentId()}`);
    try {
      const { content, sha } = await githubDb!.getRecordFileContentAndSha(
        dbName,
        tableName,
        currentId(),
      );
      setRecordFileSha(sha);
      setRecord(content);
    } catch (err) {
      console.error('getRecordFileContentAndSha, error:', err);
      setErrorMessage(
        buildErrorMessage('Failed to get file from server!', err),
      );
    }
    setRecordFileLoading('');
  };

  const renderAlert = () => {
    return (
      <>
        <SharedErrorAlert
          errorMessage={errorMessage}
          onClose={() => setErrorMessage('')}
        />
        {successMessage && (
          <Alert
            message="Success"
            description={successMessage}
            type="success"
            showIcon
            closable
            onClose={() => setSuccessMessage(null)}
            style={{ marginBottom: 16 }}
          />
        )}
      </>
    );
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
    <div className="dbm-page update-page-body-component">
      {contextHolder}
      <Skeleton loading={tips().length > 0}>
        {renderAlert()}
        {renderForm()}
      </Skeleton>
    </div>
  );
};

export default UpdatePage;
