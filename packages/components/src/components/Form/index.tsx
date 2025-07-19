import React, { useEffect, useContext, useState, ReactNode } from 'react';
import {
  Select,
  Button,
  message,
  Row,
  Col,
  Tabs,
  Popconfirm,
  InputNumber,
  Switch,
  Typography,
} from 'antd';

import StringFormField from '../StringFormField';
import RadioGroupFormField from '../RadioGroupFormField';
import JsonEditor from '../JsonEditor';
import RefTableLink from '../RefTableLink';
import PageContext from '../../contexts/page';
import MultiLineInputBox from '../MultiLineInputBox';
import * as constants from '../../constants';
import TextAreaFormField from '../TextAreaFormField';
import { isType, obj2str, str2obj, getFormInitialValues } from './helpers';
import FieldWrapperForCreateUpdatePage from '../FieldWrapperForCreateUpdatePage';
import PresetsButtons from '../PresetsButtons';
import DbColumn from '../../types/DbColumn';
import { useAppContext } from '../../contexts/AppContext';
import { RowType } from '../../types/Data';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

interface RenderFormFieldWrapperProps {
  id: string;
  label: string;
  formField: ReactNode;
}

export type ValueType = RowType;

interface FormProps {
  /** Wether to show delete button, default is true */
  showDelete?: boolean;
  defaultValues: ValueType;
  loading: boolean;
  rows: RowType[];
  onSubmit: (formValues: ValueType) => void;
  onDelete?: (formValues: ValueType) => void;
}

const renderFormFieldWrapper = ({
  id,
  label,
  formField,
}: RenderFormFieldWrapperProps) => (
  <div key={id} className="dbm-form-field dbm-string-form-field">
    <b>{label}</b>: {formField}
  </div>
);

const filterOutHiddenFields = (column: DbColumn) =>
  column[constants.TYPE_CREATE_UPDATE_PAGE] !== 'HIDE';

const Form: React.FC<FormProps> = (props) => {
  const { showDelete = true } = props;

  const pageCtx = useContext(PageContext);
  const { getTablesByDbName } = useAppContext();

  const [formValues, setFormValues] = useState({
    ...props.defaultValues,
  });
  const [jsonStr, setJsonStr] = useState(
    obj2str({
      ...props.defaultValues,
    })
  );

  useEffect(() => {
    const initFormValues = getFormInitialValues(pageCtx.columns, formValues);
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      ...initFormValues,
    }));
    setJsonStr((prevJsonStr) => {
      const prevJsonObj = str2obj(prevJsonStr);
      return obj2str({
        ...prevJsonObj,
        ...initFormValues,
      });
    });
  }, []);

  const changeBothFormAndJsonEditor = (newFormValues: ValueType) => {
    setFormValues(newFormValues);
    setJsonStr(obj2str(newFormValues));
  };

  const handleChange = (key: string) => (value: any) => {
    changeBothFormAndJsonEditor({
      ...formValues,
      [key]: value,
    });
  };

  const handleInputChange = (key: string) => (val: string /* ,event */) => {
    // if key is primary key, check if it contains any whitespace character
    if (key === pageCtx.primaryKey && /\s/.test(val)) {
      message.warning('Primary key cannot contain whitespace character');
    }

    changeBothFormAndJsonEditor({
      ...formValues,
      [key]: val,
    });
  };

  /**
   * @param {string} id Column name
   * @param {string[]} value Cell value
   */
  const handleStringArrayChange = (id: string) => (value: any) =>
    changeBothFormAndJsonEditor({
      ...formValues,
      [id]: value,
    });

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.code === 'KeyS' && event.metaKey) {
      event.preventDefault();
      handleFormSubmit();
    }
  };

  const handleFormSubmit = () => {
    props.onSubmit(formValues);
  };

  const handleDelete = () => {
    props.onDelete && props.onDelete(formValues);
  };

  const renderStringFormField = (column: DbColumn) => {
    const { loading } = props;
    const value = formValues[column.id];
    if (column[constants.TYPE_CREATE_UPDATE_PAGE] === 'TextArea') {
      return (
        <TextAreaFormField
          key={column.id}
          label={column.name}
          rows={2}
          disabled={loading}
          value={value}
          onChange={handleChange(column.id)}
        />
      );
    }
    if (column[constants.TYPE_CREATE_UPDATE_PAGE] === 'RadioGroup') {
      const radioValue = value || column?.['ui:createUpdatePage:enum']?.[0];
      return renderFormFieldWrapper({
        id: column.id,
        label: column.name,
        formField: (
          <RadioGroupFormField
            column={column}
            disabled={loading}
            value={radioValue}
            onChange={handleChange(column.id)}
          />
        ),
      });
    }
    let preview = false;
    if (column[constants.TYPE_CREATE_UPDATE_PAGE] === 'WithPreview') {
      preview = true;
    }
    return (
      <StringFormField
        key={column.id}
        inputProps={{
          disabled: loading,
          autoFocus: column.id === pageCtx.primaryKey,
          onKeyDown: handleKeyDown,
          placeholder: column['ui:createUpdatePage:placeholder'],
        }}
        preview={preview}
        column={column}
        rows={props.rows}
        value={value}
        onChange={handleInputChange(column.id)}
      />
    );
  };

  const renderStringArrayFormField = (column: DbColumn) => {
    if (
      !column[constants.TYPE_CREATE_UPDATE_PAGE] ||
      column[constants.TYPE_CREATE_UPDATE_PAGE] === 'Select'
    ) {
      return (
        <div
          key={column.id}
          className="dbm-form-field dbm-string-array-form-field"
        >
          <b>{column.name}</b>:{' '}
          <PresetsButtons
            column={column}
            onChange={(val: any) => {
              handleStringArrayChange(column.id)([
                ...(formValues[column.id] || []),
                val,
              ]);
            }}
          />{' '}
          <Select
            size="small"
            mode="tags"
            style={{ width: '100%' }}
            disabled={props.loading}
            value={formValues[column.id]}
            onChange={handleStringArrayChange(column.id)}
            onKeyDown={handleKeyDown}
          />
        </div>
      );
    }

    const { is: isMultipleInputs, preview: isMultipleInputsWithPreview } =
      isType(column, 'MultiLineInputBox');
    if (isMultipleInputs) {
      if (isMultipleInputsWithPreview) {
        return (
          <FieldWrapperForCreateUpdatePage key={column.id} column={column}>
            <Row>
              <Col span={12}>
                <MultiLineInputBox
                  rows={2}
                  disabled={props.loading}
                  value={formValues[column.id]}
                  onChange={handleStringArrayChange(column.id)}
                />
              </Col>
              <Col span={12}>
                {formValues[column.id] &&
                  formValues[column.id].map((img: string) => (
                    <a key={img} href={img} target="_blank" rel="noreferrer">
                      <img width="200px" src={img} alt="img" />
                    </a>
                  ))}
              </Col>
            </Row>
          </FieldWrapperForCreateUpdatePage>
        );
      }

      return (
        <div
          key={column.id}
          className="dbm-form-field dbm-string-array-form-field"
        >
          <b>{column.name}</b>:{' '}
          <RefTableLink
            dbName={pageCtx.dbName}
            tables={getTablesByDbName(pageCtx.dbName)}
            value={formValues[column.id]}
            column={column}
          />
          <MultiLineInputBox
            disabled={props.loading}
            value={formValues[column.id]}
            onChange={handleStringArrayChange(column.id)}
          />
        </div>
      );
    }

    return null;
  };

  const renderNumberFormField = (column: DbColumn) => {
    const { loading } = props;
    return renderFormFieldWrapper({
      id: column.id,
      label: column.name,
      formField: (
        <InputNumber
          size="small"
          disabled={loading}
          autoFocus={column.id === pageCtx.primaryKey}
          value={formValues[column.id]}
          onChange={handleChange(column.id)}
          onKeyDown={handleKeyDown}
        />
      ),
    });
  };

  const renderBoolFormField = (column: DbColumn) =>
    renderFormFieldWrapper({
      id: column.id,
      label: column.name,
      formField: (
        <Switch
          size="small"
          disabled={props.loading}
          checked={formValues[column.id]}
          onChange={handleChange(column.id)}
        />
      ),
    });

  const fieldRender = (column: DbColumn) => {
    switch (column.type) {
      case constants.STRING_ARRAY:
        return renderStringArrayFormField(column);
      case constants.NUMBER:
        return renderNumberFormField(column);
      case constants.BOOL:
        return renderBoolFormField(column);
      case constants.STRING:
      default:
        return renderStringFormField(column);
    }
  };

  const { loading } = props;
  const tabsItems = [
    {
      label: 'Form',
      key: 'form',
      children: (
        <div className="dbm-form">
          {pageCtx.columns.filter(filterOutHiddenFields).map(fieldRender)}
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
    <div className="create-update-component">
      <Tabs defaultActiveKey="form" items={tabsItems} />
      <div className="dbm-action-buttons">
        <Button
          type="primary"
          disabled={loading}
          loading={loading}
          onClick={handleFormSubmit}
        >
          Save
        </Button>{' '}
        {showDelete && (
          <>
            <Text>|</Text>{' '}
            <Popconfirm
              title="Are you sure to delete?"
              onConfirm={handleDelete}
              onCancel={() => {}}
              okText="Yes"
              cancelText="No"
            >
              <Button danger disabled={loading} loading={loading}>
                Delete
              </Button>
            </Popconfirm>{' '}
          </>
        )}
        <Text>|</Text>{' '}
        <Button
          type="link"
          href={`/${pageCtx.dbName}/${pageCtx.tableName}/create`}
        >
          Reset
        </Button>{' '}
      </div>
    </div>
  );
};

export default Form;
