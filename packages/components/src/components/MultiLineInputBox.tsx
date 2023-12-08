import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const str2arr = (str: string) => str.split('\n');
const arr2str = (arr: string[]) => arr.join('\n');

interface MultiLineInputBoxProps {
  rows?: number;
  disabled?: boolean;
  value?: string[];
  onChange?: (value: string[]) => void;
}

export default function MultiLineInputBox(props: MultiLineInputBoxProps) {
  const { value = [], onChange = () => {} } = props;
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(str2arr(event.target.value));
  };
  return (
    <Input.TextArea
      rows={3}
      {...props}
      value={arr2str(value)}
      onChange={handleChange}
    />
  );
}

MultiLineInputBox.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
};
MultiLineInputBox.defaultProps = {
  value: [],
  onChange: () => {},
};
