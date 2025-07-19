import React from 'react';
import { Input, Row, Col } from 'antd';

export interface InputProps {
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  status?: 'error' | 'warning';
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

type OnChangeType = (
  value: string,
  event: React.ChangeEvent<HTMLInputElement>
) => void;

interface StringFormFieldValueProps {
  value?: string;
  preview?: boolean;
  inputProps?: InputProps;
  onChange?: OnChangeType;
}

const StringFormFieldValue = (props: StringFormFieldValueProps) => {
  const { value, preview } = props;

  const renderInput = () => {
    const { value, inputProps, onChange = () => {} } = props;
    return (
      <Input
        {...inputProps}
        size='small'
        value={value}
        onChange={(event) => {
          onChange(event.target.value, event);
        }}
      />
    );
  };

  const input = renderInput();

  // TODO DELETE
  if (!preview) {
    return input;
  }
  return (
    <Row gutter={16}>
      <Col span={12}>{input}</Col>
      <Col span={12}>
        <a href={value} target='_blank' rel='noreferrer'>
          {value ? (
            <img
              width='200px'
              src={value}
              alt='img'
              style={{ border: '1px solid' }}
            />
          ) : null}
        </a>
      </Col>
    </Row>
  );
};

export default StringFormFieldValue;
