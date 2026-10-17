import React, { useCallback, useContext, useEffect } from 'react';
import { message, Alert, Spin } from 'antd';

import * as utils from '../../utils';
import PageContext from '../../contexts/page';
import Detail from './Detail';
import { RowType } from '../../types/Data';

const GetPageBody = () => {
  const { dbName, tableName, appModes, primaryKey, githubDbV2, columns } =
    useContext(PageContext);

  const [contentLoading, setContentLoading] = React.useState(false);
  const [contentLoaded, setContentLoaded] = React.useState(false);
  const [refTables, setRefTables] = React.useState({});
  const [errorMessage, setErrorMessage] = React.useState('');
  const [record, setRecord] = React.useState({}); // One record in table rows

  // Create the initial form fields according to whether create/update.
  const getInitialFormFields = useCallback(
    (tableRows: RowType[]) => {
      const currentId = utils.getUrlParams()[primaryKey];
      const foundRows = tableRows.filter((item) =>
        utils.isSamePrimaryKey(item[primaryKey], currentId),
      );

      if (foundRows.length === 0) {
        setErrorMessage('item not found in db');
        return null;
      }
      if (foundRows.length > 1) {
        setErrorMessage('more than 1 rows');
        return null;
      }

      return {
        ...foundRows[0],
      };
    },
    [primaryKey],
  );

  const getSingleRecordAsync = useCallback(() => {
    /**
     * If primary key is "itemId", and this field value is "foo", then return "foo"
     */
    const currentId = () => {
      return utils.getUrlParams()[primaryKey];
    };
    // ValueType vs DataType
    return githubDbV2!
      .getRow(dbName, tableName, currentId())
      .then((res: { row: RowType } | null) => {
        setContentLoaded(true);

        if (res && res.row) {
          setRecord(res.row);
        } else {
          message.error('item not found in db');
        }
      })
      .catch((err: Error) => {
        console.error('githubDbV2.getRow failed, err:', err);
        message.error('something wrong in githubDbV2.getRow');
      });
  }, [dbName, tableName, githubDbV2, primaryKey]);

  const getTableRowsAsync = useCallback(() => {
    return githubDbV2
      ?.getTableRows(dbName, tableName)
      .then(({ content }: { content: RowType }) => {
        return content as RowType[];
      })
      .then((tableRows: RowType[]) => {
        setContentLoaded(true);
        const r = getInitialFormFields(tableRows);
        if (r) {
          setRecord(r);
        } else {
          message.error('item not found in db');
        }
      })
      .catch((err: Error) => {
        console.error('getTableRows failed, err:', err);
        message.error('something wrong in getTableRows');
      });
  }, [dbName, tableName, getInitialFormFields, githubDbV2]);

  // page mount or db/table change load data
  useEffect(() => {
    setContentLoading(true);
    const ps = [];

    if (appModes.indexOf('split-table') !== -1) {
      ps.push(getSingleRecordAsync());
    } else {
      ps.push(getTableRowsAsync());
    }

    const getRefTablePromises = columns
      .filter(({ referenceTable }) => referenceTable)
      .map(({ referenceTable }) => {
        return githubDbV2!
          .getTableRows(dbName, referenceTable!)
          .then(({ content }: { content: RowType[] }) => {
            setRefTables((prevRefTables) => ({
              ...prevRefTables,
              [`ref:${referenceTable}:rows`]: content, // TODO
            }));
          });
      });

    // console.debug('Start getting all table data...');
    Promise.all([...ps, ...getRefTablePromises])
      .then(() => {
        // console.debug('Finish getting all table data...');
      })
      .finally(() => {
        setContentLoading(false);
      });
  }, [
    dbName,
    tableName,
    columns,
    getSingleRecordAsync,
    getTableRowsAsync,
    githubDbV2,
    appModes,
  ]);

  const renderAlert = () =>
    errorMessage && <Alert message={errorMessage} type="error" />;

  const renderDetail = () => {
    if (record === null) {
      return null;
    }
    return <Detail defaultValues={record} refTables={refTables} />;
  };

  if (contentLoading) {
    return <Spin />;
  }

  if (!contentLoaded) {
    return null;
  }

  return (
    <div className="get-body-component">
      {renderAlert()}
      {renderDetail()}
    </div>
  );
};

export default GetPageBody;
