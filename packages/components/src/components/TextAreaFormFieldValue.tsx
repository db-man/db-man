import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const TextAreaFormFieldValue = (props: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    const { onChange } = props;
    onChange(event.target.value);
  };

  const { value } = props;
  return (
    <Input.TextArea
      rows={3}
      {...props} /* eslint-disable-line react/jsx-props-no-spreading */
      value={value}
      onChange={handleChange}
    />
  );
};

TextAreaFormFieldValue.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

TextAreaFormFieldValue.defaultProps = {
  value: '',
  onChange: () => {},
};

export default TextAreaFormFieldValue;
