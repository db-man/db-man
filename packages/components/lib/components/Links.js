function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import PropTypes from 'prop-types';
import * as types from './types';
export function Fragment(props) {
  return props.children;
}
export function Link({
  children,
  href,
  text
}) {
  if (children) {
    return /*#__PURE__*/React.createElement("a", {
      className: "dm-dd-link",
      href: children,
      target: "_blank",
      rel: "noreferrer"
    }, children);
  }

  return /*#__PURE__*/React.createElement("a", {
    className: "dm-dd-link",
    href: href,
    target: "_blank",
    rel: "noreferrer"
  }, text);
}
Link.propTypes = types.linkShape;
Link.defaultProps = {
  children: '',
  href: '',
  text: ''
};
export function Links({
  links
}) {
  return /*#__PURE__*/React.createElement("div", null, links.map(({
    href,
    text
  }, index) =>
  /*#__PURE__*/

  /* eslint-disable-next-line react/no-array-index-key */
  React.createElement(Link, {
    key: index,
    href: href,
    text: text
  })));
}
Links.propTypes = {
  links: PropTypes.arrayOf(types.link)
};
Links.defaultProps = {
  links: []
};
/**
 * @param {string|string[]|undefined} props.description
 * @returns
 */

export function ImageLink({
  children,
  url,
  imgSrc,
  description
}) {
  let url2 = url;
  let imgSrc2 = imgSrc;

  if (children) {
    url2 = children;
    imgSrc2 = children;
  }

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    className: "dm-dd-image-link",
    href: url2,
    rel: "noreferrer",
    target: "_blank"
  }, /*#__PURE__*/React.createElement("span", null, url2), /*#__PURE__*/React.createElement("img", {
    alt: "ImageLink",
    src: imgSrc2
  })), /*#__PURE__*/React.createElement("br", null), description);
}
ImageLink.propTypes = {
  children: PropTypes.string,
  url: PropTypes.string,
  imgSrc: PropTypes.string,
  description: PropTypes.string
};
ImageLink.defaultProps = {
  children: '',
  url: '',
  imgSrc: '',
  description: ''
};
export function ImageLinks({
  imgs,
  limit = 3
}) {
  if (!imgs) return null;
  let results = imgs;

  if (limit !== null) {
    results = imgs.slice(0, limit);
  } // eslint-disable-next-line react/no-array-index-key, react/jsx-props-no-spreading


  return results.map((img, index) => /*#__PURE__*/React.createElement(ImageLink, _extends({
    key: index
  }, img)));
}