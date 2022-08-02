/* eslint-disable react/destructuring-assignment, react/no-access-state-in-setstate, react/forbid-prop-types, max-len */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Select, Button, message, Row, Col, Tabs, Popconfirm, InputNumber, Switch,
} from 'antd';

import StringFormField from '../StringFormField';
import RadioGroupFormField from '../RadioGroupFormField';
import JsonEditor from '../JsonEditor';
import RefTableLink from '../RefTableLink';
import PageContext from '../../contexts/page';
import MultipleInputs from '../MultipleInputs';
import { dbs } from '../../dbs';
import * as constants from '../../constants';
import TextAreaFormField from '../TextAreaFormField';
import { validatePrimaryKey, isType } from './helpers';

const renderFormFieldWrapper = (id, label, formField) => (
  <div key={id} className="dm-form-field dm-string-form-field">
    <b>{label}</b>
    :
    {' '}
    {formField}
  </div>
);

export default class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formValues: {
        ...this.props.defaultValues,
      },
    };
  }

  componentDidMount() {
    this.context.columns.forEach((col) => {
      if (!this.state.formValues[col.id]) {
        let defaultValue = '';
        switch (col['type:createUpdatePage']) {
          case 'RadioGroup': [defaultValue] = col.enum; break;
          default: defaultValue = '';
        }
        if (defaultValue) {
          this.setState(((prevState) => ({ ...prevState, formValues: { ...prevState.formValues, [col.id]: defaultValue } })));
        }
      }
    });
  }

  handleChange = (key) => (value) => {
    this.setState({
      formValues: {
        ...this.state.formValues,
        [key]: value,
      },
    });
  };

  handleInputChange = (key) => (event) => {
    this.setState({
      formValues: {
        ...this.state.formValues,
        [key]: event.target.value,
      },
    });
    // validate the primary field in form, e.g. duplication check
    // TODO maybe do this in antd Form component
    // TODO why do we assume the type of primary column in a table is always `string`?
    if (key === this.context.primaryKey) {
      if (
        !validatePrimaryKey(
          event.target.value,
          this.props.rows,
          this.context.primaryKey,
        )
      ) {
        this.warnPrimaryKeyInvalid(event.target.value);
      }
    }
  };

  /**
   * @param {string} id Column name
   * @param {string[]} value Cell value
   */
  handleStringArrayChange = (id) => (value) => this.setState({
    formValues: {
      ...this.state.formValues,
      [id]: value,
    },
  });

  handleJsonEditorChange = (formValues) => {
    this.setState({ formValues });
  };

  handleKeyDown = (event) => {
    if (event.code === 'KeyS' && event.metaKey) {
      event.preventDefault();
      this.handleFormSubmit();
    }
  };

  handleFormSubmit = () => {
    const { formValues } = this.state;
    this.props.onSubmit(formValues);
  };

  handleDelete = () => {
    const { formValues } = this.state;
    this.props.onDelete(formValues);
  };

  warnPrimaryKeyInvalid = (value) => message.warn(
    <div>
      Found duplicated item in db
      {' '}
      <a
        href={`/${this.context.dbName}/${this.context.tableName}/update?${this.context.primaryKey}=${value}`}
      >
        {value}
      </a>
    </div>,
    10,
  );

  renderStringFormField = (column) => {
    const { loading } = this.props;
    const value = this.state.formValues[column.id];
    if (column['type:createUpdatePage'] === 'TextArea') {
      return (
        <TextAreaFormField
          key={column.id}
          label={column.name}
          rows={2}
          disabled={loading}
          value={value}
          onChange={this.handleChange(column.id)}
        />
      );
    }
    if (column['type:createUpdatePage'] === 'RadioGroup') {
      const radioValue = value || column.enum[0];
      return renderFormFieldWrapper(
        column.id,
        column.name, (
          <RadioGroupFormField
            column={column}
            disabled={loading}
            value={radioValue}
            onChange={this.handleChange(column.id)}
          />
        ),
      );
    }
    let preview = false;
    if (column['type:createUpdatePage'] === 'WithPreview') {
      preview = true;
    }
    return (
      <StringFormField
        key={column.id}
        inputProps={{
          disabled: loading,
          autoFocus: column.id === this.context.primaryKey,
          onKeyDown: this.handleKeyDown,
          placeholder: column.placeholder,
        }}
        preview={preview}
        label={column.name}
        dbName={this.context.dbName}
        primaryKey={this.context.primaryKey}
        column={column}
        value={value}
        onChange={this.handleInputChange(column.id)}
      />
    );
  };

  renderStringArrayFormField = (column) => {
    const { formValues } = this.state;

    if (
      !column['type:createUpdatePage']
      || column['type:createUpdatePage'] === 'Select'
    ) {
      return (
        <div
          key={column.id}
          className="dm-form-field dm-string-array-form-field"
        >
          <b>{column.name}</b>
          :
          {' '}
          <Select
            size="small"
            mode="tags"
            style={{ width: '100%' }}
            disabled={this.props.loading}
            value={formValues[column.id]}
            onChange={this.handleStringArrayChange(column.id)}
            onKeyDown={this.handleKeyDown}
          />
        </div>
      );
    }

    const { is: isMultipleInputs, preview: isMultipleInputsWithPreview } = isType(column, 'MultipleInputs');
    if (isMultipleInputs) {
      if (isMultipleInputsWithPreview) {
        return (
          <div
            key={column.id}
            className="dm-form-field dm-string-array-form-field"
          >
            <b>{column.name}</b>
            :
            {' '}
            <Row>
              <Col span={12}>
                <MultipleInputs
                  rows={2}
                  disabled={this.props.loading}
                  value={formValues[column.id]}
                  onChange={this.handleStringArrayChange(column.id)}
                />
              </Col>
              <Col span={12}>
                {formValues[column.id]
                  && formValues[column.id].map((img) => (
                    <a key={img} href={img} target="_blank" rel="noreferrer">
                      <img width="200px" src={img} alt="img" />
                    </a>
                  ))}
              </Col>
            </Row>
          </div>
        );
      }

      return (
        <div
          key={column.id}
          className="dm-form-field dm-string-array-form-field"
        >
          <b>{column.name}</b>
          :
          {' '}
          <RefTableLink
            dbName={this.context.dbName}
            tables={dbs[this.context.dbName]}
            value={formValues[column.id]}
            column={column}
          />
          <MultipleInputs
            disabled={this.props.loading}
            value={formValues[column.id]}
            onChange={this.handleStringArrayChange(column.id)}
          />
        </div>
      );
    }

    return null;
  };

  renderNumberFormField = (column) => {
    const { loading } = this.props;
    return renderFormFieldWrapper(
      column.id,
      column.name, (
        <InputNumber
          size="small"
          disabled={loading}
          autoFocus={column.id === this.context.primaryKey}
          value={this.state.formValues[column.id]}
          onChange={this.handleChange(column.id)}
          onKeyDown={this.handleKeyDown}
        />
      ),
    );
  };

  renderBoolFormField = (column) => renderFormFieldWrapper(
    column.id,
    column.name, (
      <Switch
        size="small"
        disabled={this.props.loading}
        checked={this.state.formValues[column.id]}
        onChange={this.handleChange(column.id)}
      />
    ),
  );

  render() {
    const { loading } = this.props;
    return (
      <div className="create-update-component">
        <Tabs defaultActiveKey="form">
          <Tabs.TabPane tab="Form" key="form">
            <div className="dm-form">
              {this.context.columns.filter((column) => column['type:createUpdatePage'] !== 'HIDE').map((column) => {
                switch (column.type) {
                  case constants.STRING_ARRAY:
                    return this.renderStringArrayFormField(column);
                  case constants.NUMBER:
                    return this.renderNumberFormField(column);
                  case constants.BOOL:
                    return this.renderBoolFormField(column);
                  case constants.STRING:
                  default:
                    return this.renderStringFormField(column);
                }
              })}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="JSON" key="json">
            <JsonEditor
              value={this.state.formValues}
              onChange={this.handleJsonEditorChange}
            />
          </Tabs.TabPane>
        </Tabs>

        <div className="dm-action-buttons">
          <Button
            type="primary"
            disabled={loading}
            loading={loading}
            onClick={this.handleFormSubmit}
          >
            Save
          </Button>
          {' '}
          |
          {' '}
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={this.handleDelete}
            onCancel={() => {}}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              disabled={loading}
              loading={loading}
            >
              Delete
            </Button>
          </Popconfirm>
          {' '}
          |
          {' '}
          <Button
            type="link"
            href={`/${this.context.dbName}/${this.context.tableName}/create`}
          >
            Reset
          </Button>
          {' '}
        </div>
      </div>
    );
  }
}

Form.propTypes = {
  rows: PropTypes.array,
  defaultValues: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
};

Form.defaultProps = {
  rows: [],
  onSubmit: () => {},
  onDelete: () => {},
};

Form.contextType = PageContext;
