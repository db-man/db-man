function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import PropTypes from 'prop-types';
import TextAreaFormFieldValue from './TextAreaFormFieldValue';
export default function TextAreaFormField(props) {
  const {
    label,
    value,
    onChange
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    className: "dm-form-field dm-string-form-field"
  }, /*#__PURE__*/React.createElement("b", null, label), ":", ' ', /*#__PURE__*/React.createElement(TextAreaFormFieldValue, _extends({
    value: value,
    onChange: onChange
  }, props)));
}
TextAreaFormField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func
};
TextAreaFormField.defaultProps = {
  value: '',
  onChange: () => {}
};