import React, { useState, ChangeEvent } from 'react';
import { Input } from 'antd';

import { ValueType } from './Form';
import { str2obj } from './Form/helpers';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFormValueChange: (value: ValueType) => void;
  onSave?: () => void;
}

const JsonEditor: React.FC<JsonEditorProps> = (props) => {
  const { value, onChange, onFormValueChange, onSave = () => {} } = props;
  const [errMsg, setErrMsg] = useState('');

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);

    setErrMsg('');
    try {
      const obj = str2obj(event.target.value);
      onFormValueChange(obj);
    } catch (error) {
      setErrMsg(
        `There is something wrong in JSON text, detail: ${
          (error as Error).message
        }`
      );
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.code === 'KeyS' && event.metaKey) {
      event.preventDefault();
      onSave();
    }
  };

  return (
    <div>
      <Input.TextArea
        autoSize
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {errMsg && <div style={{ color: 'red' }}>{errMsg}</div>}
    </div>
  );
};

export default JsonEditor;
