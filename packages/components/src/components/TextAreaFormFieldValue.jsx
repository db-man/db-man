import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

export default class TextAreaFormFieldValue extends React.Component {
  handleChange = (event) => {
    const { onChange } = this.props;
    onChange(event.target.value);
  };

  render() {
    const { value } = this.props;
    return (
      <Input.TextArea
        rows={3}
        {...this.props} /* eslint-disable-line react/jsx-props-no-spreading */
        value={value}
        onChange={this.handleChange}
      />
    );
  }
}

TextAreaFormFieldValue.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

TextAreaFormFieldValue.defaultProps = {
  value: '',
  onChange: () => {},
};
