import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import { columnType } from './types';

function RadioGroupFormField(props) {
  const {
    value, disabled, column, onChange,
  } = props;
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <Radio.Group
      onChange={handleChange}
      value={value}
      disabled={disabled}
    >
      {column.enum.map((r) => (
        <Radio key={r} value={r}>
          {r}
        </Radio>
      ))}
    </Radio.Group>
  );
}

export default RadioGroupFormField;

RadioGroupFormField.propTypes = {
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  column: columnType.isRequired,
  onChange: PropTypes.func,
};

RadioGroupFormField.defaultProps = {
  onChange: () => {},
};
