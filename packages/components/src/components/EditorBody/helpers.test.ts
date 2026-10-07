import DbColumn from 'types/DbColumn';

import {
  checkFieldValue,
  FILENAME_TOO_LONG,
  getFormInitialValues,
  isType,
  obj2str,
  str2obj,
  validatePrimaryKey,
} from './helpers';

const makeColumn = (extra: Partial<DbColumn> = {}): DbColumn =>
  Object.assign({ id: 'name', name: 'Name', type: 'STRING' } as DbColumn, extra);

describe('validatePrimaryKey', () => {
  const content = [{ id: 'foo' }, { id: 'bar' }];

  it('should accept a value which is not used by any record yet', () => {
    expect(validatePrimaryKey('baz', content, 'id')).toBe(true);
  });

  it('should reject a value which is already used by another record', () => {
    expect(validatePrimaryKey('foo', content, 'id')).toBe(false);
  });

  it('should accept any value when the table is empty', () => {
    expect(validatePrimaryKey('foo', [], 'id')).toBe(true);
  });

  it('compares with ===, so a number does not match the string read from the form', () => {
    // The value always comes from a form input (a string), while a record read
    // from GitHub may hold a number. They are treated as different records.
    expect(validatePrimaryKey('1', [{ id: 1 }], 'id')).toBe(true);
  });

  it('should only look at the primary key column', () => {
    expect(validatePrimaryKey('foo', [{ id: 'bar', name: 'foo' }], 'id')).toBe(
      true
    );
  });
});

describe('isType', () => {
  it('should match a single ui type written as a plain string', () => {
    const column = makeColumn({
      'type:createUpdatePage': 'MultiLineInputBox',
    });

    expect(isType(column, 'MultiLineInputBox')).toEqual({
      is: true,
      preview: false,
    });
    expect(isType(column, 'TextArea')).toEqual({ is: false, preview: false });
  });

  it('should match a ui type written as a one element array', () => {
    const column = makeColumn({
      'type:createUpdatePage': ['MultiLineInputBox'],
    });

    expect(isType(column, 'MultiLineInputBox')).toEqual({
      is: true,
      preview: false,
    });
  });

  it('should report preview when the array carries WithPreview', () => {
    const column = makeColumn({
      'type:createUpdatePage': ['MultiLineInputBox', 'WithPreview'],
    });

    expect(isType(column, 'MultiLineInputBox')).toEqual({
      is: true,
      preview: true,
    });
  });

  it('should not report preview for any other second element', () => {
    const column = makeColumn({
      'type:createUpdatePage': ['MultiLineInputBox', 'NoPreview'],
    });

    expect(isType(column, 'MultiLineInputBox')).toEqual({
      is: true,
      preview: false,
    });
  });

  it('should never report preview for the string form', () => {
    // "WithPreview" alone is just the type name, not the preview flag.
    const column = makeColumn({ 'type:createUpdatePage': 'WithPreview' });

    expect(isType(column, 'WithPreview')).toEqual({
      is: true,
      preview: false,
    });
  });

  it('should handle a column without any ui type', () => {
    expect(isType(makeColumn(), 'MultiLineInputBox')).toEqual({
      is: false,
      preview: false,
    });
  });
});

describe('obj2str / str2obj', () => {
  it('should pretty print with a two space indent', () => {
    expect(obj2str({ name: 'foo', tags: ['a', 'b'] })).toBe(
      '{\n  "name": "foo",\n  "tags": [\n    "a",\n    "b"\n  ]\n}'
    );
  });

  it('should round trip a nested value', () => {
    const value = { name: 'foo', count: 3, nested: { ok: true } };

    expect(str2obj(obj2str(value))).toEqual(value);
  });

  it('should throw on invalid json', () => {
    expect(() => str2obj('{not json')).toThrow();
  });
});

describe('getFormInitialValues', () => {
  const radioGroupColumns = [
    makeColumn({
      id: 'role',
      'type:createUpdatePage': 'RadioGroup',
      'ui:createUpdatePage:enum': ['Maintainer', 'Developer'],
    }),
  ];

  it('should take the first enum value as the default of a RadioGroup column', () => {
    expect(getFormInitialValues(radioGroupColumns, {})).toEqual({
      role: 'Maintainer',
    });
  });

  it('should skip a RadioGroup column without enum values', () => {
    const columns = [
      makeColumn({ id: 'role', 'type:createUpdatePage': 'RadioGroup' }),
    ];

    expect(getFormInitialValues(columns, {})).toEqual({});
  });

  it('should skip a RadioGroup column whose enum is empty', () => {
    const columns = [
      makeColumn({
        id: 'role',
        'type:createUpdatePage': 'RadioGroup',
        'ui:createUpdatePage:enum': [],
      }),
    ];

    expect(getFormInitialValues(columns, {})).toEqual({});
  });

  it('should skip a RadioGroup column whose first enum value is empty', () => {
    const columns = [
      makeColumn({
        id: 'role',
        'type:createUpdatePage': 'RadioGroup',
        'ui:createUpdatePage:enum': ['', 'Developer'],
      }),
    ];

    expect(getFormInitialValues(columns, {})).toEqual({});
  });

  it('should skip columns which are not a RadioGroup', () => {
    const columns = [
      makeColumn({ id: 'name' }),
      makeColumn({ id: 'notes', 'type:createUpdatePage': 'MultiLineInputBox' }),
    ];

    expect(getFormInitialValues(columns, {})).toEqual({});
  });

  it('should not overwrite a value which is already in the form', () => {
    expect(getFormInitialValues(radioGroupColumns, { role: 'Developer' })).toEqual(
      {}
    );
  });

  it('should still apply the default when the value in the form is empty', () => {
    // The guard is a truthy check, so an empty string counts as "not set".
    expect(getFormInitialValues(radioGroupColumns, { role: '' })).toEqual({
      role: 'Maintainer',
    });
  });

  it('should only fill the RadioGroup columns among many', () => {
    const columns = [
      makeColumn({ id: 'name' }),
      makeColumn({
        id: 'role',
        'type:createUpdatePage': 'RadioGroup',
        'ui:createUpdatePage:enum': ['Maintainer', 'Developer'],
      }),
      makeColumn({ id: 'notes', 'type:createUpdatePage': 'MultiLineInputBox' }),
    ];

    expect(getFormInitialValues(columns, { name: 'foo' })).toEqual({
      role: 'Maintainer',
    });
  });
});

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

  it('should not check the length of a non primary key column', () => {
    expect(
      checkFieldValue({
        column: makeColumn({ id: 'name' }),
        primaryKey,
        value: 'a'.repeat(300),
      })
    ).toBe('');
  });
});
