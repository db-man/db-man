import DbColumn from '../../types/DbColumn';

import { checkValidTableColumns } from './helpers';

describe('checkValidTableColumns', () => {
  it('should return an error message if no columns are defined in the table', () => {
    const dbTableColumns: DbColumn[] = [];
    const result = checkValidTableColumns(dbTableColumns);
    expect(result).toBe('No columns defined in the table. ');
  });

  it('should return an error message if there are invalid keys in the columns', () => {
    const dbTableColumns: DbColumn[] = [
      { id: '1', name: 'Column1', type: 'string', invalidKey: 'value' } as any,
    ];
    const result = checkValidTableColumns(dbTableColumns);
    expect(result).toBe('Column 1: Invalid key: invalidKey; ');
  });

  it('should return an empty string if all columns are valid', () => {
    const dbTableColumns: DbColumn[] = [
      { id: '1', name: 'Column1', type: 'STRING' },
      { id: '2', name: 'Column2', type: 'NUMBER' },
    ];
    const result = checkValidTableColumns(dbTableColumns);
    expect(result).toBe('');
  });

  it('should return multiple error messages for multiple invalid keys', () => {
    const dbTableColumns: DbColumn[] = [
      { id: 'c1', name: 'Col1', type: 'STRING', invalidKey1: 'value' } as any,
      { id: 'c2', name: 'Col2', type: 'NUMBER', invalidKey2: 'value' } as any,
    ];
    const result = checkValidTableColumns(dbTableColumns);
    expect(result).toBe(
      'Column c1: Invalid key: invalidKey1; Column c2: Invalid key: invalidKey2; '
    );
  });
});
