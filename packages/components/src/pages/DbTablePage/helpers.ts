import DbColumn, {
  TABLE_COLUMN_KEYS,
  TableColumnKeyType,
} from '../../types/DbColumn';

export const checkValidTableColumns = (dbTableColumns: DbColumn[]) => {
  let msg = '';
  if (dbTableColumns.length === 0) {
    msg += 'No columns defined in the table. ';
  }
  dbTableColumns.forEach((col) => {
    // check every properties of a column, should be in this list TABLE_COLUMN_KEYS
    Object.keys(col).forEach((key) => {
      if (TABLE_COLUMN_KEYS.indexOf(key as TableColumnKeyType) < 0) {
        msg += `Column ${col.id}: Invalid key: ${key}; `;
      }
    });
  });
  return msg;
};
