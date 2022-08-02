import React from 'react';
import PropTypes from 'prop-types';
import { Input, Row, Col } from 'antd';

export default class StringFormFieldValue extends React.Component {
  renderInput = () => {
    const { value, inputProps, onChange } = this.props;
    return (
      <Input
        {...inputProps} /* eslint-disable-line react/jsx-props-no-spreading */
        size="small"
        value={value}
        onChange={onChange}
      />
    );
  };

  renderValue = () => {
    const { value, preview } = this.props;
    const input = this.renderInput();
    // DELETE
    if (!preview) {
      return input;
    }
    return (
      <Row gutter={16}>
        <Col span={12}>{input}</Col>
        <Col span={12}>
          <a href={value} target="_blank" rel="noreferrer">
            {value ? (
              <img
                width="200px"
                src={value}
                alt="img"
                style={{ border: '1px solid' }}
              />
            ) : null}
          </a>
        </Col>
      </Row>
    );
  };

  render() {
    return this.renderValue();
  }
}

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
