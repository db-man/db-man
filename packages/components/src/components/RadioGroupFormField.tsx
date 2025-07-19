import React from 'react';
import PropTypes from 'prop-types';
import { Radio, RadioChangeEvent } from 'antd';
import { columnType } from './types';
import DbColumn from '../types/DbColumn';
import { FieldSchemaWarning } from './FormValidations';

function RadioGroupFormField(props: {
  value: string;
  disabled: boolean;
  column: DbColumn;
  onChange: (value: string) => void;
}) {
  const { value, disabled, column, onChange = () => {} } = props;
  const handleChange = (e: RadioChangeEvent) => {
    onChange(e.target.value);
  };

  return (
    <>
      <FieldSchemaWarning
        expectedType='object'
        fieldSchema={column['ui:createUpdatePage:enum']}
      />
      {typeof column['ui:createUpdatePage:enum'] !== 'object' ? null : (
        <Radio.Group onChange={handleChange} value={value} disabled={disabled}>
          {column['ui:createUpdatePage:enum'].map((r) => (
            <Radio key={r} value={r}>
              {r}
            </Radio>
          ))}
        </Radio.Group>
      )}
    </>
  );
}

export default RadioGroupFormField;

RadioGroupFormField.propTypes = {
  value: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  column: columnType.isRequired,
  onChange: PropTypes.func,
};
