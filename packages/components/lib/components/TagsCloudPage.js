/* eslint-disable react/prop-types */
import React from 'react';
import TagsCloudPageBody from './TagsCloudPageBody';
export default function TagsCloudPage(props) {
  const {
    dbName,
    tableName
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    className: "tags-cloud-page"
  }, /*#__PURE__*/React.createElement(TagsCloudPageBody, {
    dbName: dbName,
    tableName: tableName
  }));
}