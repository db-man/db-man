/* eslint-disable react/destructuring-assignment, no-console, max-len, react/no-unused-class-component-methods */

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { message, Spin, Alert } from 'antd';
import { utils as githubUtils } from '@db-man/github';

import { validatePrimaryKey } from './Form/helpers';
import SuccessMessage from './SuccessMessage';
import * as utils from '../utils';
import Form, { ValueType } from './Form';
import PageContext from '../contexts/page';
import * as constants from '../constants';
import { RowType } from '../types/Data';

const CreatePage = () => {
  const { appModes, githubDb, dbName, tableName, primaryKey, columns } =
    useContext(PageContext);

  const [errorMessage, setErrorMessage] = useState('');
  // all rows in table file
  const [tableFileLoading, setTableFileLoading] = useState(false);
  // all rows in whole table, in split table mode, it's empty
  const [rows, setRows] = useState<RowType[]>([]);
  const [tableFileSha, setTableFileSha] = useState<string | null>(null);
  const [defaultFormValues, setDefaultFormValues] = useState<ValueType | null>(
    null
  );
  const [saveLoading, setSaveLoading] = useState(false);

  const isSplitTable = useCallback(() => {
    return appModes.indexOf('split-table') !== -1;
  }, [appModes]);

  const getTableFileAsync = useCallback(async () => {
    setTableFileLoading(true);
    try {
      const _result = await githubDb?.getTableRows(dbName, tableName);
      if (_result) {
        setRows(_result.content);
        setTableFileSha(_result.sha);
      }
    } catch (err) {
      console.error('getTableRows, error:', err);
      setErrorMessage('Failed to get table file from server!');
    }
    setTableFileLoading(false);
  }, [dbName, githubDb, tableName]);

  // Get single record file, the whole table file will be used to de-dup
  const getData = useCallback(() => {
    const ps = [];
    // Whole table file is too big, so only get it when it's not split table
    if (!isSplitTable()) {
      ps.push(getTableFileAsync());
    }
    Promise.all(ps);
  }, [getTableFileAsync, isSplitTable]);

  // Create the initial form fields
  const getInitialFormFields = useCallback(() => {
    const fields: ValueType = {};

    // Fill the form field with URL params
    columns
      .filter((col) => utils.getUrlParams()[col.id])
      .forEach((col) => {
        if (col.type === constants.STRING_ARRAY) {
          fields[col.id] = [utils.getUrlParams()[col.id]];
        } else {
          fields[col.id] = utils.getUrlParams()[col.id];
        }
      });

    return fields;
  }, [columns]);

  useEffect(() => {
    getData();

    const fields = getInitialFormFields();
    setDefaultFormValues({
      ...fields,
    });
  }, [getData, getInitialFormFields]);

  // `updateTableFileAsync` to update the whole table file, it's too big, and take more time to get the response from server
  // `createRecordFileAsync` to only create record file, file is small, so get response quickly, but backend (github action) need to merge records into big table file
  const handleFormSubmit = (formValues: ValueType) => {
    if (!isSplitTable()) {
      updateTableFileAsync(formValues);
    } else {
      createRecordFileAsync(formValues);
    }
  };

  const updateTableFileAsync = async (formValues: ValueType) => {
    const newContent: RowType[] = [...rows];

    if (!formValidation(rows, formValues)) {
      return;
    }

    const time = githubUtils.formatDate(new Date());
    newContent.push({
      ...formValues,
      createdAt: time,
      updatedAt: time,
    });

    setSaveLoading(true);
    try {
      const _result = await githubDb?.updateTableFile(
        dbName,
        tableName,
        newContent,
        tableFileSha
      );

      if (_result) {
        message.success(<SuccessMessage url={_result.commit.html_url} />, 10);
      }
    } catch (err) {
      console.error('updateTableFile, err:', err);
      setErrorMessage('Failed to update table file on server!');
    }

    setSaveLoading(false);
  };

  const createRecordFileAsync = async (formValues: ValueType) => {
    const time = githubUtils.formatDate(new Date());
    const record = {
      ...formValues,
      createdAt: time,
      updatedAt: time,
    };

    setSaveLoading(true);
    try {
      const _result = await githubDb?.updateRecordFile(
        dbName,
        tableName,
        primaryKey,
        record,
        null // recordFileSha
      );

      if (_result) {
        message.success(<SuccessMessage url={_result.commit.html_url} />, 10);
      }
    } catch (err) {
      console.error('updateRecordFile, err:', err);
      setErrorMessage('Failed to create record file on server!');
    }

    setSaveLoading(false);
  };

  const formValidation = (rows: RowType[], formValues: ValueType) => {
    if (!validatePrimaryKey(formValues[primaryKey], rows, primaryKey)) {
      warnPrimaryKeyInvalid(formValues[primaryKey]);
      return false;
    }
    return true;
  };

  const warnPrimaryKeyInvalid = (value: string) =>
    message.warning(
      <div>
        Found duplicated item in db{' '}
        <a href={`/${dbName}/${tableName}/update?${primaryKey}=${value}`}>
          {value}
        </a>
      </div>,
      10
    );

  if (defaultFormValues === null) {
    return null;
  }

  return (
    <div className='dm-page'>
      <h1>
        Create {dbName} {tableName}
      </h1>
      <div className='create-page-body-component'>
        <Spin
          spinning={tableFileLoading}
          tip={
            <div>
              Loading file:{' '}
              <a
                href={githubDb?.getDataUrl(dbName, tableName)}
                target='_blank'
                rel='noreferrer'
              >
                {dbName}/{tableName}
              </a>
            </div>
          }
        >
          {errorMessage && <Alert message={errorMessage} type='error' />}
          <Form
            defaultValues={defaultFormValues}
            rows={rows}
            loading={saveLoading}
            onSubmit={handleFormSubmit}
          />
        </Spin>
      </div>
    </div>
  );
};

export default CreatePage;
