import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import PropTypes from 'prop-types';

interface SelectFormFieldProps {
  label: string;
  value?: SelectProps['value'];
  options: SelectProps['options'];
  disabled?: SelectProps['disabled'];
  onChange?: SelectProps['onChange'];
}

export default function SelectFormField(props: SelectFormFieldProps) {
  const { label, value = '', onChange = () => {} } = props;
  return (
    <div className="dbm-form-field dbm-string-form-field">
      <b>{label}</b>:{' '}
      <Select
        style={{ width: '100%' }}
        allowClear
        value={value}
        onChange={onChange}
        {...props} /* eslint-disable-line react/jsx-props-no-spreading */
      />
    </div>
  );
}

SelectFormField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
