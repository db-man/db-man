/* eslint-disable import/prefer-default-export */
import { utils } from 'db-man';
export const getNewRows = (formValues, oldRows, primaryKey, currentId) => oldRows.map(row => {
  if (row[primaryKey] !== currentId) {
    return row;
  } // To update an existing item


  return { ...row,
    ...formValues,
    updatedAt: utils.formatDate(new Date())
  };
});