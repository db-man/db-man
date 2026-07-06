import React from 'react';
import PropTypes from 'prop-types';

import TextAreaFormFieldValue from './TextAreaFormFieldValue';

interface TextAreaFormFieldProps {
  value?: string;
  rows?: number;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export default function TextAreaFormField(props: TextAreaFormFieldProps) {
  const { value = '', onChange = () => {} } = props;
  return (
    <TextAreaFormFieldValue
      value={value}
      onChange={onChange}
      {...props} /* eslint-disable-line react/jsx-props-no-spreading */
    />
  );
}

TextAreaFormField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};
