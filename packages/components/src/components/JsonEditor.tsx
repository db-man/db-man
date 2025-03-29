import React, { useState, ChangeEvent } from 'react';
import { Input } from 'antd';

import { str2obj } from './Form/helpers';

export type FormValueType = Record<string, any>;

interface JsonEditorProps {
  value: string;
  // when text area value changes
  onTextAreaChange: (value: string) => void;
  // after text area value changes, only when text area value is valid JSON, call this function
  onJsonObjectChange: (value: FormValueType) => void;
  onSave?: () => void;
}

const JsonEditor: React.FC<JsonEditorProps> = (props) => {
  const {
    value,
    onTextAreaChange,
    onJsonObjectChange,
    onSave = () => {},
  } = props;
  const [errMsg, setErrMsg] = useState('');

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onTextAreaChange(event.target.value);

    setErrMsg('');
    try {
      const obj = str2obj(event.target.value);
      onJsonObjectChange(obj);
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
        status={errMsg ? 'error' : ''}
        value={value}
        onChange={handleTextAreaChange}
        onKeyDown={handleKeyDown}
      />
      {errMsg && <div style={{ color: 'red' }}>{errMsg}</div>}
    </div>
  );
};

export default JsonEditor;
