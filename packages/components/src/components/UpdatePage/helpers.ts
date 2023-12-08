import { utils as githubUtils } from '@db-man/github';
import { ValueType } from '../Form';
import { RowType } from '../../types/Data';

export const getNewRows = (
  formValues: ValueType,
  oldRows: RowType[],
  primaryKey: string,
  currentId: string
) =>
  oldRows.map((row) => {
    if (row[primaryKey] !== currentId) {
      return row;
    }
    // To update an existing item
    return {
      ...row,
      ...formValues,
      updatedAt: githubUtils.formatDate(new Date()),
    };
  });
