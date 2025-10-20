import { useContext, useState } from 'react';

import { Tabs, Button, Alert, message, Typography } from 'antd';
import { types } from '@db-man/github';

import CommonPageContext from '../../contexts/commonPage';
import JsonEditor, { FormValueType } from '../../components/JsonEditor';
import { obj2str } from '../../components/Form/helpers';
import StringFormFieldValue from '../../components/StringFormFieldValue';
import SuccessMessage from '../../components/SuccessMessage';
import { reloadDbsSchemaAsync } from '../../pages/Settings/helpers';

import * as constants from '../../constants';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

const defaultFormValues: FormValueType = {
  name: '',
  description: '',
  tables: [],
};

const CreateDbPage = () => {
  const { githubDb } = useContext(CommonPageContext);
  const [messageApi, contextHolder] = message.useMessage();

  const [formValues, setFormValues] = useState(defaultFormValues);
  const [jsonStr, setJsonStr] = useState(obj2str(defaultFormValues));
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const changeBothFormAndJsonEditor = (newFormValues: FormValueType) => {
    setFormValues(newFormValues);
    setJsonStr(obj2str(newFormValues));
  };

  const handleInputChange = (key: string) => (val: string /* ,event */) => {
    changeBothFormAndJsonEditor({
      ...formValues,
      [key]: val,
    });
  };

  const handleFormSubmit = async () => {
    const dbConfig = {
      ...formValues,
    } as types.DatabaseSchema;

    setSaveLoading(true);
    try {
      const _result = await githubDb?.createDatabaseSchema(dbConfig);

      if (_result) {
        messageApi.success(
          <SuccessMessage
            message="Database schema created."
            url={_result.commit.html_url}
          />,
          10
        );
      }
    } catch (err) {
      console.error('createDatabaseSchema, err:', err);
      setErrorMessage('Failed to create database schema on server!');
    }

    setSaveLoading(false);
  };

  const handleReloadDbsSchema = () => {
    reloadDbsSchemaAsync(
      localStorage.getItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN) || '',
      localStorage.getItem(constants.LS_KEY_GITHUB_OWNER) || '',
      localStorage.getItem(constants.LS_KEY_GITHUB_REPO_NAME) || '',
      messageApi
    );
  };

  const tabsItems = [
    {
      label: 'Form',
      key: 'form',
      children: (
        <div className="dbm-form">
          <div className="dbm-form-field dbm-string-form-field">
            <b>Name</b>:{' '}
            <StringFormFieldValue
              value={formValues.name}
              onChange={handleInputChange('name')}
            />
          </div>
          <div className="dbm-form-field dbm-string-form-field">
            <b>Description</b>:{' '}
            <StringFormFieldValue
              value={formValues.description}
              onChange={handleInputChange('description')}
            />
          </div>
        </div>
      ),
    },
    {
      label: 'JSON',
      key: 'json',
      children: (
        <JsonEditor
          value={jsonStr}
          onTextAreaChange={setJsonStr}
          onJsonObjectChange={setFormValues}
          onSave={() => {
            handleFormSubmit();
          }}
        />
      ),
    },
  ];

  return (
    <div className="create-db-page">
      {contextHolder}
      <h1>Create Database</h1>
      {errorMessage && <Alert message={errorMessage} type="error" />}
      <Tabs defaultActiveKey="form" items={tabsItems} />
      <div className="dbm-action-buttons">
        <Button
          type="primary"
          disabled={saveLoading}
          loading={saveLoading}
          onClick={handleFormSubmit}
        >
          Create
        </Button>{' '}
        <Text>|</Text>{' '}
        <Button onClick={handleReloadDbsSchema}>Reload DBs Schema</Button>
      </div>
    </div>
  );
};

export default CreateDbPage;
