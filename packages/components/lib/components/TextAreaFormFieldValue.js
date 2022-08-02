function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
export default class TextAreaFormFieldValue extends React.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "handleChange", event => {
      const {
        onChange
      } = this.props;
      onChange(event.target.value);
    });
  }

  render() {
    const {
      value
    } = this.props;
    return /*#__PURE__*/React.createElement(Input.TextArea, _extends({
      rows: 3
    }, this.props, {
      /* eslint-disable-line react/jsx-props-no-spreading */
      value: value,
      onChange: this.handleChange
    }));
  }

}
TextAreaFormFieldValue.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
};
TextAreaFormFieldValue.defaultProps = {
  value: '',
  onChange: () => {}
};