import React from 'react';
import PropTypes from 'prop-types';
import { Input, Row, Col } from 'antd';

export interface InputProps {
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

interface StringFormFieldValueProps {
  value?: string;
  preview?: boolean;
  inputProps?: InputProps;
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
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

  // DELETE
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

StringFormFieldValue.propTypes = {
  value: PropTypes.string,
  preview: PropTypes.bool,
  inputProps: PropTypes.shape({
    disabled: PropTypes.bool,
    autoFocus: PropTypes.bool,
    onKeyDown: PropTypes.func,
  }),
  onChange: PropTypes.func,
};
StringFormFieldValue.defaultProps = {
  value: '',
  // Props to pass directly to antd's Input component
  inputProps: {
    // disabled
    // autoFocus
    // onKeyDown
  },
  preview: false,
  onChange: () => {},
};
