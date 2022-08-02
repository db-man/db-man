import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Input, Popover, Button } from 'antd';
export default function ErrorAlert({
  json,
  error,
  tplStr,
  record
}) {
  return /*#__PURE__*/React.createElement(Alert, {
    message: /*#__PURE__*/React.createElement("div", null, "Failed to parse JSON generated from template, fallback to render plain text.", /*#__PURE__*/React.createElement("div", null, "The generated JSON:", /*#__PURE__*/React.createElement(Input.TextArea, {
      defaultValue: json
    })), /*#__PURE__*/React.createElement(Popover, {
      content: /*#__PURE__*/React.createElement("div", {
        style: {
          width: '800px'
        }
      }, /*#__PURE__*/React.createElement("div", null, "Error:", error.message), /*#__PURE__*/React.createElement("div", null, "tplStr:", ' ', /*#__PURE__*/React.createElement(Input.TextArea, {
        defaultValue: tplStr
      })), /*#__PURE__*/React.createElement("div", null, "record:", ' ', /*#__PURE__*/React.createElement(Input.TextArea, {
        rows: 7,
        defaultValue: JSON.stringify(record, null, 2)
      }))),
      title: "Debug Info",
      trigger: "click"
    }, /*#__PURE__*/React.createElement(Button, {
      danger: true
    }, "Debug Info"))),
    type: "error",
    closable: true
  });
}
ErrorAlert.propTypes = {
  json: PropTypes.string.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string
  }).isRequired,
  tplStr: PropTypes.string.isRequired,
  record: PropTypes.string.isRequired
};