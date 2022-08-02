/* eslint-disable react/prop-types */

import React from 'react';

import TagsCloudPageBody from './TagsCloudPageBody';

export default function TagsCloudPage(props) {
  const {
    dbName, tableName,
  } = props;
  return (
    <div className="tags-cloud-page">
      <TagsCloudPageBody
        dbName={dbName}
        tableName={tableName}
      />
    </div>
  );
}
