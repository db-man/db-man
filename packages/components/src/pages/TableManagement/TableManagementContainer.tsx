import { useContext, useEffect, useState } from 'react';

import { types } from '@db-man/github';
import { message, Typography } from 'antd';
import SuccessMessage from 'components/SuccessMessage';
import CommonPageContext from 'contexts/commonPage';

import TableManagementEditableTable from './TableManagementEditableTable';

// Use `Typography` so can apply dark theme to text
const { Title } = Typography;

const TableManagementContainer = ({
  dbName,
  tableName,
}: {
  dbName: string;
  tableName: string;
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { githubDb } = useContext(CommonPageContext);

  const [dbSchema, setDbSchema] = useState<types.DatabaseSchema | null>(null);
  const [databaseSchemaSha, setDatabaseSchemaSha] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    githubDb
      ?.getDbTablesSchemaV2Async(dbName)
      .then(({ obj, sha }) => {
        setDbSchema(obj);
        setDatabaseSchemaSha(sha);
      })
      .catch((err) => {
        messageApi.error('Failed to load database schema');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dbName, githubDb, messageApi]);

  if (!dbSchema || !databaseSchemaSha) {
    return <div>dbSchema or databaseSchemaSha is not loaded</div>;
  }

  const defaultTableSchema = dbSchema.tables.find(
    (table) => table.name === tableName
  );

  if (!defaultTableSchema) {
    return (
      <div>
        table {tableName} is not found in db {dbName}
      </div>
    );
  }

  const handleUpdateTableSchema = (tableSchema: types.DbTable) => {
    const newDbSchema = {
      ...dbSchema,
      // update a specific table schema in database schema
      tables: dbSchema.tables.map((table) =>
        table.name === tableName ? tableSchema : table
      ),
    };

    setIsLoading(true);
    githubDb
      ?.updateDatabaseSchema(newDbSchema, databaseSchemaSha)
      .then(({ commit }) => {
        messageApi.success(
          <SuccessMessage
            message="Table schema updated."
            url={commit.html_url}
          />,
          10
        );
      })
      .catch((err) => {
        console.error('Failed to update table schema', err);
        messageApi.error('Failed to update table schema');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {contextHolder}
      <Title level={2}>Table Schema Management</Title>
      <div>Table Name: {defaultTableSchema.name}</div>
      <div>Table Description: {defaultTableSchema.description}</div>
      <TableManagementEditableTable
        isLoading={isLoading}
        defaultTableSchema={defaultTableSchema}
        onUpdateTableSchema={handleUpdateTableSchema}
      />
    </>
  );
};

export default TableManagementContainer;
