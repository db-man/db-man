import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import PropTypes from 'prop-types';

interface SelectFormFieldProps {
  value?: SelectProps['value'];
  options: SelectProps['options'];
  disabled?: SelectProps['disabled'];
  onChange?: SelectProps['onChange'];
}

export default function SelectFormField(props: SelectFormFieldProps) {
  const { value = '', onChange = () => {} } = props;
  return (
    <Select
      style={{ width: '100%' }}
      allowClear
      value={value}
      onChange={onChange}
      {...props} /* eslint-disable-line react/jsx-props-no-spreading */
    />
  );
}

SelectFormField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};
