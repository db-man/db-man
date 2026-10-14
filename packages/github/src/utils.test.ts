import { formatDate, getRecordFileName, isSamePrimaryKey } from './utils';

describe('formatDate', () => {
  it('should format date', () => {
    expect(
      formatDate(new Date('2021-07-04T01:16:01.000Z')),
    ).toBe('2021-07-04 09:16:01');
  });
});

describe('getRecordFileName', () => {
  it('should build the same file name for a numeric primary key and its string form', () => {
    expect(getRecordFileName(1)).toBe('1.json');
    expect(getRecordFileName('1')).toBe('1.json');
    expect(getRecordFileName(1)).toBe(getRecordFileName('1'));
  });

  it('should keep digits, dot and hyphen as-is', () => {
    expect(getRecordFileName(0)).toBe('0.json');
    expect(getRecordFileName(-1)).toBe('-1.json');
    expect(getRecordFileName(1.5)).toBe('1.5.json');
    expect(getRecordFileName(1744820403529)).toBe('1744820403529.json');
  });

  it('should sanitize characters that are not filename safe', () => {
    expect(getRecordFileName('a/b c')).toBe('a_b_c.json');
    expect(getRecordFileName('a#b')).toBe('a_b.json');
    // exponent notation contains "+", which is not portable in a file name
    expect(getRecordFileName(1e21)).toBe('1e_21.json');
  });
});

describe('isSamePrimaryKey', () => {
  it('should match a numeric primary key with its string form', () => {
    // A NUMBER column is the number 1 in the data file and the string '1' in a
    // URL query or a form field, so `===` finds nothing.
    expect(isSamePrimaryKey(1, '1')).toBe(true);
    expect(isSamePrimaryKey('1', 1)).toBe(true);
    expect(isSamePrimaryKey(1e22, '1e+22')).toBe(true);
    expect(isSamePrimaryKey('foo', 'foo')).toBe(true);
  });

  it('should not match different keys', () => {
    expect(isSamePrimaryKey(1, 2)).toBe(false);
    expect(isSamePrimaryKey('foo', 'bar')).toBe(false);
    expect(isSamePrimaryKey(1, '1a')).toBe(false);
  });

  // String(null) is 'null' and String(undefined) is 'undefined', so both would
  // match each other — and a row that has no primary key would be picked as the
  // row of a missing query parameter.
  it('should match nothing when either side has no value', () => {
    expect(isSamePrimaryKey(null, null)).toBe(false);
    expect(isSamePrimaryKey(undefined, undefined)).toBe(false);
    expect(isSamePrimaryKey(null, undefined)).toBe(false);
    expect(isSamePrimaryKey('1', undefined)).toBe(false);
    expect(isSamePrimaryKey(null, 1)).toBe(false);
  });
});
