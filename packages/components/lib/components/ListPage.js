import React from 'react';
import PropTypes from 'prop-types';
import ListPageBody from './ListPageBody';
export default function ListPage(props) {
  const {
    tableName
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    className: "dm-list-page"
  }, /*#__PURE__*/React.createElement(ListPageBody, {
    tableName: tableName
  }));
}
ListPage.propTypes = {
  tableName: PropTypes.string.isRequired
};