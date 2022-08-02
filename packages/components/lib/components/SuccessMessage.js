import React from 'react';
import PropTypes from 'prop-types';

function SuccessMessage({
  url
}) {
  console.debug('Commit link:', url); // eslint-disable-line no-console

  return /*#__PURE__*/React.createElement("div", null, "Item saved.", ' ', /*#__PURE__*/React.createElement("a", {
    href: url,
    target: "_blank",
    rel: "noreferrer"
  }, "Commit link"));
}

SuccessMessage.propTypes = {
  url: PropTypes.string.isRequired
};
export default SuccessMessage;