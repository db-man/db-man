import { utils as githubUtils } from '@db-man/github';
import { ValueType } from '../../../components/EditorBody';
import { isSamePrimaryKey } from '../../../utils';
import { RowType } from '../../../types/Data';

export const getNewRows = (
  formValues: ValueType,
  oldRows: RowType[],
  primaryKey: string,
  currentId: string,
) =>
  oldRows.map((row) => {
    if (!isSamePrimaryKey(row[primaryKey], currentId)) {
      return row;
    }
    // To update an existing item
    return {
      ...row,
      ...formValues,
      updatedAt: githubUtils.formatDate(new Date()),
    };
  });
