import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const str2arr = (str) => str.split('\n');
const arr2str = (arr) => arr.join('\n');

export default function MultipleInputs(props) {
  const { value, onChange } = props;
  const handleChange = (event) => {
    onChange(str2arr(event.target.value));
  };
  return (
    <Input.TextArea
      rows={3}
      {...props} /* eslint-disable-line react/jsx-props-no-spreading */
      value={arr2str(value)}
      onChange={handleChange}
    />
  );
}

MultipleInputs.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
};
MultipleInputs.defaultProps = {
  value: [],
  onChange: () => {},
};
