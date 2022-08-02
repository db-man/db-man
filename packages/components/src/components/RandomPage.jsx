/* eslint-disable react/prop-types */

import React from 'react';

import RandomPageBody from './RandomPageBody';

export default function RandomPage(props) {
  const {
    dbName, tableName,
  } = props;
  return (
    <div className="random-page">
      <RandomPageBody
        dbName={dbName}
        tableName={tableName}
      />
    </div>
  );
}
