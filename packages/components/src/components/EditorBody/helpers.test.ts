import DbColumn from 'types/DbColumn';

import { checkFieldValue, FILENAME_TOO_LONG } from './helpers';

describe('checkFieldValue', () => {
  const column: DbColumn = {
    id: 'userId',
    name: 'User ID',
    type: 'STRING',
  };
  const primaryKey = 'userId';
  it('should return error message if the value is invalid', () => {
    const value = 'a'.repeat(251); // 251 + '.json' > 255
    expect(checkFieldValue({ column, primaryKey, value })).toBe(
      FILENAME_TOO_LONG
    );
  });

  it('should return true if the value is valid', () => {
    const value = 'a'.repeat(250);
    expect(checkFieldValue({ column, primaryKey, value })).toBe('');
  });
});
